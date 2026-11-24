"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type VoiceRecorderSupport = "pending" | "supported" | "unsupported" | "insecure";
export type VoiceRecorderStatus = "idle" | "starting" | "recording";
export type VoiceRecorderError = "permission-denied" | "no-microphone" | "recording-failed" | "interrupted";

export type VoiceRecording =
  | { kind: "audio"; blob: Blob; durationMs: number; reachedLimit: boolean }
  // Nothing was recorded: the press only served to answer the browser's
  // permission prompt, or it ended before the microphone was available.
  | { kind: "not-started"; reason: "permission" | "released" }
  | { kind: "cancelled" }
  | { kind: "error"; error: VoiceRecorderError };

// First supported wins. Chrome/Edge/Firefox record WebM (or Ogg) Opus;
// Safari/iOS only record MP4 AAC.
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];

// Plenty for speech, and keeps a 2-minute note well under 1 MB. Browsers
// may ignore it (Safari often does); the upload limit still has headroom.
const AUDIO_BITS_PER_SECOND = 32_000;

// If the permission API can't tell us whether a prompt was shown, a
// getUserMedia call slower than this almost certainly waited on a human
// answering one.
const PROMPT_HEURISTIC_MS = 1000;

// Safety net in case a recorder never fires `stop` -- the mic is released
// regardless.
const STOP_TIMEOUT_MS = 3000;

type Session = {
  stream?: MediaStream;
  recorder?: MediaRecorder;
  chunks: Blob[];
  startedAt: number;
  // The press ended before recording began.
  released: boolean;
  reachedLimit: boolean;
  limitTimer?: ReturnType<typeof setTimeout>;
  stopTimer?: ReturnType<typeof setTimeout>;
  done: boolean;
  resolve: (result: VoiceRecording) => void;
};

function subscribe() {
  return () => {};
}

function getSupport(): VoiceRecorderSupport {
  if (!window.isSecureContext) return "insecure";
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return "unsupported";
  return "supported";
}

function getServerSupport(): VoiceRecorderSupport {
  return "pending";
}

type PermissionHint = "granted" | "prompt" | "denied" | "unknown";

// Not every browser can query the microphone permission (older Safari and
// Firefox throw) -- "unknown" falls back to the timing heuristic.
async function queryMicrophonePermission(): Promise<PermissionHint> {
  try {
    const status = await navigator.permissions.query({ name: "microphone" as PermissionName });
    return status.state;
  } catch {
    return "unknown";
  }
}

function errorForGetUserMedia(err: unknown): VoiceRecorderError {
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "permission-denied";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "no-microphone";
  return "recording-failed";
}

function createRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type));
  try {
    return new MediaRecorder(stream, { mimeType, audioBitsPerSecond: AUDIO_BITS_PER_SECOND });
  } catch {
    // Some browsers reject options they don't support; let them pick.
    return new MediaRecorder(stream);
  }
}

function stopTracks(stream: MediaStream) {
  for (const track of stream.getTracks()) {
    track.onended = null;
    track.stop();
  }
}

// Stops everything a session holds so the browser's microphone indicator
// turns off. Safe to call more than once.
function releaseSession(session: Session) {
  clearTimeout(session.limitTimer);
  clearTimeout(session.stopTimer);
  const recorder = session.recorder;
  if (recorder) {
    recorder.ondataavailable = null;
    recorder.onstop = null;
    recorder.onerror = null;
    if (recorder.state !== "inactive") {
      try {
        recorder.stop();
      } catch {
        // Already stopping -- tracks are stopped below either way.
      }
    }
  }
  if (session.stream) stopTracks(session.stream);
}

// Press-to-record audio capture with native getUserMedia + MediaRecorder.
// start() resolves once the recording ends -- via stop(), cancel(), the
// duration limit, an interruption, or an error -- and the microphone is
// always released by then. Only one recording runs at a time.
export function useVoiceRecorder(maxDurationMs: number) {
  const support = useSyncExternalStore(subscribe, getSupport, getServerSupport);
  const [status, setStatus] = useState<VoiceRecorderStatus>("idle");
  const [startedAt, setStartedAt] = useState(0);
  const sessionRef = useRef<Session | null>(null);

  const finish = useCallback((session: Session, result: VoiceRecording) => {
    if (session.done) return;
    session.done = true;
    releaseSession(session);
    if (sessionRef.current === session) {
      sessionRef.current = null;
      setStatus("idle");
    }
    session.resolve(result);
  }, []);

  const stopSession = useCallback(
    (session: Session) => {
      const recorder = session.recorder;
      if (!recorder) {
        // Still waiting on getUserMedia (possibly a permission prompt) --
        // settle once it answers, without ever starting to record.
        session.released = true;
        return;
      }
      if (recorder.state === "inactive") return;
      try {
        recorder.stop();
      } catch {
        finish(session, { kind: "error", error: "recording-failed" });
        return;
      }
      session.stopTimer = setTimeout(
        () => finish(session, { kind: "error", error: "recording-failed" }),
        STOP_TIMEOUT_MS
      );
    },
    [finish]
  );

  const start = useCallback((): Promise<VoiceRecording> => {
    if (sessionRef.current) return Promise.resolve({ kind: "cancelled" });

    return new Promise<VoiceRecording>((resolve) => {
      const session: Session = { chunks: [], startedAt: 0, released: false, reachedLimit: false, done: false, resolve };
      sessionRef.current = session;
      setStatus("starting");

      // Both requests go out synchronously inside the press handler so iOS
      // treats getUserMedia as user-initiated.
      const permission = queryMicrophonePermission();
      const requestedAt = performance.now();
      let streamRequest: Promise<MediaStream>;
      try {
        streamRequest = navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
        });
      } catch (err) {
        finish(session, { kind: "error", error: errorForGetUserMedia(err) });
        return;
      }

      streamRequest.then(
        async (stream) => {
          // Cancelled or unmounted while waiting: drop the mic immediately.
          if (session.done) {
            stopTracks(stream);
            return;
          }
          session.stream = stream;

          // Never begin recording after a permission prompt -- the original
          // press may be long over. The user presses again, intentionally.
          const hint = await permission;
          const promptLikely =
            hint === "prompt" || (hint === "unknown" && performance.now() - requestedAt > PROMPT_HEURISTIC_MS);
          if (session.done) return;
          if (promptLikely) {
            finish(session, { kind: "not-started", reason: "permission" });
            return;
          }
          if (session.released) {
            finish(session, { kind: "not-started", reason: "released" });
            return;
          }

          let recorder: MediaRecorder;
          try {
            recorder = createRecorder(stream);
          } catch {
            finish(session, { kind: "error", error: "recording-failed" });
            return;
          }
          session.recorder = recorder;

          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) session.chunks.push(event.data);
          };
          recorder.onstop = () => {
            const type = recorder.mimeType || session.chunks[0]?.type || "";
            finish(session, {
              kind: "audio",
              blob: new Blob(session.chunks, { type }),
              durationMs: performance.now() - session.startedAt,
              reachedLimit: session.reachedLimit,
            });
          };
          recorder.onerror = () => finish(session, { kind: "error", error: "recording-failed" });
          // Mic unplugged, taken by a phone call, revoked, etc.
          for (const track of stream.getTracks()) {
            track.onended = () => finish(session, { kind: "error", error: "interrupted" });
          }

          try {
            // No timeslice: Safari has produced unplayable chunks with one.
            recorder.start();
          } catch {
            finish(session, { kind: "error", error: "recording-failed" });
            return;
          }
          session.startedAt = performance.now();
          session.limitTimer = setTimeout(() => {
            session.reachedLimit = true;
            stopSession(session);
          }, maxDurationMs);
          setStartedAt(Date.now());
          setStatus("recording");
        },
        (err) => finish(session, { kind: "error", error: errorForGetUserMedia(err) })
      );
    });
  }, [finish, stopSession, maxDurationMs]);

  const stop = useCallback(() => {
    const session = sessionRef.current;
    if (session) stopSession(session);
  }, [stopSession]);

  // Read from the live session, not render state, so event handlers never
  // act on a stale status.
  const isRecording = useCallback(() => sessionRef.current?.recorder?.state === "recording", []);

  const cancel = useCallback(() => {
    const session = sessionRef.current;
    if (session) finish(session, { kind: "cancelled" });
  }, [finish]);

  // Backgrounding (app switch, screen lock, tab switch) or leaving the page
  // discards the recording rather than leaving the mic running unseen.
  // Unmount (e.g. navigating away) always cancels and releases the mic.
  useEffect(() => {
    function interrupt() {
      const session = sessionRef.current;
      if (session) finish(session, { kind: "error", error: "interrupted" });
    }
    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") interrupt();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", interrupt);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", interrupt);
      const session = sessionRef.current;
      if (session) finish(session, { kind: "cancelled" });
    };
  }, [finish]);

  return { support, status, startedAt, start, stop, cancel, isRecording };
}
