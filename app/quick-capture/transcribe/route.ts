import { createClient } from "@/lib/supabase/server";
import { isSupportedAudioType, transcribeAudio, TranscriptionError } from "@/lib/ai/transcribeAudio";
import { SESSION_EXPIRED_MESSAGE } from "@/lib/sessionMessages";

// Comfortably below Vercel's 4.5 MB request-body limit. A 2-minute voice
// note at the recorder's compressed bitrate is well under 1 MB, so anything
// near this is not a real Quick Capture recording.
const MAX_AUDIO_BYTES = 4 * 1024 * 1024;
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

const TOO_LARGE_MESSAGE = "That recording is too long. Try a shorter voice note.";
const NO_AUDIO_MESSAGE = "No recording was received. Please try again.";

function jsonError(error: string, status: number) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

function messageForError(error: TranscriptionError): string {
  switch (error.code) {
    case "empty_input":
      return NO_AUDIO_MESSAGE;
    case "unsupported_format":
      return "This browser recorded audio in a format Trove can't transcribe. You can still type your note.";
    case "missing_config":
      return "Voice transcription isn't configured on the server. Contact the site administrator.";
    case "api_error":
      return "Couldn't transcribe that recording. Please try again in a moment.";
  }
}

export async function POST(request: Request) {
  // Same defense-in-depth check as the Quick Capture server actions: proxy.ts
  // already redirects signed-out requests, but this route never relies on it.
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return jsonError(SESSION_EXPIRED_MESSAGE, 401);
  }

  // Reject obviously oversized uploads before reading the body.
  if (Number(request.headers.get("content-length")) > MAX_AUDIO_BYTES + MULTIPART_OVERHEAD_BYTES) {
    return jsonError(TOO_LARGE_MESSAGE, 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError(NO_AUDIO_MESSAGE, 400);
  }

  const audio = formData.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return jsonError(NO_AUDIO_MESSAGE, 400);
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return jsonError(TOO_LARGE_MESSAGE, 413);
  }
  if (!isSupportedAudioType(audio.type)) {
    return jsonError(messageForError(new TranscriptionError("unsupported_format", audio.type)), 415);
  }

  try {
    const text = await transcribeAudio(audio);
    return Response.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    // Provider errors can contain request details. Log only the error category.
    console.error("Voice transcription failed", err instanceof TranscriptionError ? err.code : "unexpected_error");
    if (err instanceof TranscriptionError) {
      return jsonError(messageForError(err), err.code === "api_error" ? 502 : 500);
    }
    return jsonError("Something went wrong while transcribing. Please try again.", 500);
  }
}
