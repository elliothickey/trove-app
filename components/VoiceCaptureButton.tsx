"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Button from "@/components/ui/Button";
import { MicIcon } from "@/components/ui/icons";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/sessionMessages";
import { useVoiceRecorder, type VoiceRecorderError } from "@/lib/useVoiceRecorder";

const TRANSCRIBE_URL = "/quick-capture/transcribe";
const MAX_RECORDING_MS = 2 * 60 * 1000;
const MIN_RECORDING_MS = 600;

export type VoiceMessage = { tone: "error" | "info"; text: string };

const RECORDER_ERRORS: Record<VoiceRecorderError, string> = {
  "permission-denied":
    "Microphone access is blocked. Allow it for this site in your browser settings to use voice.",
  "no-microphone": "No microphone was found.",
  "recording-failed": "Couldn't record audio. Please try again.",
  interrupted: "Recording stopped because it was interrupted. Nothing was added.",
};

const NETWORK_ERROR = "Couldn't reach the server. Check your connection and try again.";
const TRANSCRIBE_ERROR = "Couldn't transcribe that recording. Please try again.";

type TranscriptResult = { ok: true; text: string } | { ok: false; error: string };

// Throws only if `signal` aborts; every other failure becomes a safe message.
async function requestTranscript(blob: Blob, signal: AbortSignal): Promise<TranscriptResult> {
  const body = new FormData();
  body.append("audio", blob, "recording");

  let response: Response;
  try {
    // `manual` so a signed-out request's redirect to /login (from proxy.ts)
    // surfaces as a redirect instead of being followed to an HTML page.
    response = await fetch(TRANSCRIBE_URL, { method: "POST", body, signal, redirect: "manual" });
  } catch (err) {
    if (signal.aborted) throw err;
    return { ok: false, error: NETWORK_ERROR };
  }

  if (response.type === "opaqueredirect" || response.status === 401) {
    return { ok: false, error: SESSION_EXPIRED_MESSAGE };
  }
  if (response.status === 413) {
    return { ok: false, error: "That recording is too long. Try a shorter voice note." };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (err) {
    if (signal.aborted) throw err;
    return { ok: false, error: TRANSCRIBE_ERROR };
  }
  const payload = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  if (response.ok && typeof payload.text === "string") {
    return { ok: true, text: payload.text };
  }
  return { ok: false, error: typeof payload.error === "string" ? payload.error : TRANSCRIBE_ERROR };
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

// Hold-to-talk voice input for Quick Capture. Only ever hands a finished,
// non-empty transcript to `onTranscript` -- it never touches the note
// itself, and never extracts or saves anything.
export default function VoiceCaptureButton({
  disabled,
  onTranscript,
  onBusyChange,
  onMessageChange,
}: {
  disabled: boolean;
  onTranscript: (text: string) => void;
  onBusyChange: (busy: boolean) => void;
  onMessageChange: (message: VoiceMessage | null) => void;
}) {
  const recorder = useVoiceRecorder(MAX_RECORDING_MS);
  const [transcribing, setTranscribing] = useState(false);
  const [now, setNow] = useState(0);
  // Which input is holding the button, so the matching release ends it.
  const pressRef = useRef<"pointer" | "keyboard" | null>(null);
  // The one in-flight transcription; a response for any other is stale.
  const requestRef = useRef<AbortController | null>(null);

  const recording = recorder.status === "recording";
  const busy = recorder.status !== "idle" || transcribing;

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    if (!recording) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [recording]);

  // Leaving the page mid-transcription abandons the request; the hook
  // separately releases the mic.
  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  async function transcribe(blob: Blob, reachedLimit: boolean) {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setTranscribing(true);
    try {
      const result = await requestTranscript(blob, controller.signal);
      if (requestRef.current !== controller) return;
      if (!result.ok) {
        onMessageChange({ tone: "error", text: result.error });
        return;
      }
      const text = result.text.trim();
      if (!text) {
        onMessageChange({ tone: "info", text: "Didn't catch anything. Try again, a little closer to the mic." });
        return;
      }
      onTranscript(text);
      if (reachedLimit) {
        onMessageChange({ tone: "info", text: "Recording stopped at the 2-minute limit." });
      }
    } catch {
      // Aborted (unmount or superseded) -- nothing to report.
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setTranscribing(false);
      }
    }
  }

  async function record() {
    onMessageChange(null);
    if (recorder.support === "insecure") {
      onMessageChange({ tone: "error", text: "Voice input needs a secure (HTTPS) connection. You can still type your note." });
      return;
    }
    if (recorder.support !== "supported") {
      onMessageChange({ tone: "error", text: "Voice input isn't supported in this browser. You can still type your note." });
      return;
    }

    const result = await recorder.start();
    // The recording is over (e.g. it hit the time limit mid-hold, or the
    // release event never arrived) -- don't let a stale press block the next.
    pressRef.current = null;
    switch (result.kind) {
      case "cancelled":
        return;
      case "not-started":
        onMessageChange({
          tone: "info",
          text:
            result.reason === "permission"
              ? "Microphone is ready. Press and hold to record."
              : "Too short. Hold the button while you speak.",
        });
        return;
      case "error":
        onMessageChange({ tone: "error", text: RECORDER_ERRORS[result.error] });
        return;
      case "audio":
        if (result.durationMs < MIN_RECORDING_MS || result.blob.size === 0) {
          onMessageChange({ tone: "info", text: "Too short. Hold the button while you speak." });
          return;
        }
        await transcribe(result.blob, result.reachedLimit);
    }
  }

  const canStart = !disabled && !busy;

  function beginPress(kind: "pointer" | "keyboard") {
    if (!canStart || pressRef.current) return;
    pressRef.current = kind;
    void record();
  }

  function endPress(kind: "pointer" | "keyboard") {
    if (pressRef.current !== kind) return;
    pressRef.current = null;
    recorder.stop();
  }

  // A genuine cancel: Escape, or the system took the press away
  // (pointercancel). A recording in progress is discarded; one still waiting
  // on the mic or a permission prompt settles as "not started".
  function abortPress() {
    if (pressRef.current === null) return;
    pressRef.current = null;
    if (recorder.isRecording()) {
      recorder.cancel();
      onMessageChange({ tone: "info", text: "Recording cancelled. Nothing was added." });
    } else {
      recorder.stop();
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (!canStart) return;
    // Keep receiving pointerup even if the finger/cursor drifts off the button.
    event.currentTarget.setPointerCapture(event.pointerId);
    beginPress("pointer");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape" && pressRef.current) {
      event.preventDefault();
      abortPress();
      return;
    }
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    if (!event.repeat) beginPress("keyboard");
  }

  function handleKeyUp(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== " " && event.key !== "Enter") return;
    event.preventDefault();
    endPress("keyboard");
  }

  const label = recording
    ? "Recording. Release to stop."
    : transcribing
      ? "Transcribing voice note"
      : "Hold to record a voice note";

  return (
    <Button
      variant={recording ? "danger" : "secondary"}
      disabled={disabled || transcribing || recorder.support === "pending"}
      aria-label={label}
      title={recording || transcribing ? undefined : "Hold to talk"}
      onPointerDown={handlePointerDown}
      onPointerUp={() => endPress("pointer")}
      onPointerCancel={abortPress}
      // Browsers can end capture without delivering pointerup (e.g. a
      // release they only see as a buttonless move). That is still the user
      // letting go, so it stops and keeps the recording -- never a cancel.
      // After a normal pointerup this is a no-op.
      onLostPointerCapture={() => endPress("pointer")}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onBlur={() => endPress("keyboard")}
      onContextMenu={(event) => event.preventDefault()}
      className={
        "touch-none select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]" +
        (recording ? " ring-3 ring-danger/20" : "")
      }
    >
      {recording ? (
        <>
          <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-danger" />
          <span className="tabular-nums">{formatElapsed(Math.max(0, now - recorder.startedAt))}</span>
        </>
      ) : transcribing ? (
        <>
          <MicIcon />
          <span>Transcribing…</span>
        </>
      ) : (
        <>
          <MicIcon />
          <span className="hidden sm:inline">Hold to record</span>
        </>
      )}
    </Button>
  );
}
