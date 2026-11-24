import OpenAI, { toFile } from "openai";

// Provider-specific details (model, SDK, file naming) are isolated to this
// module, like extractContact.ts. The rest of the app only calls
// transcribeAudio() and gets plain text back -- swapping providers later
// should not require touching any caller.
const MODEL = "gpt-4o-mini-transcribe";

// Voice notes are short; fail fast instead of the SDK's multi-minute default
// so the user gets an error (and can retry or type) without a long hang.
const REQUEST_TIMEOUT_MS = 30_000;

// Container formats MediaRecorder produces across browsers (Chrome/Edge/
// Firefox: WebM or Ogg Opus; Safari/iOS: MP4 AAC), mapped to the file
// extension the transcription API uses to detect the format.
const EXTENSIONS: Record<string, string> = {
  "audio/webm": "webm",
  "audio/ogg": "ogg",
  "audio/mp4": "mp4",
  "audio/x-m4a": "m4a",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
};

export type TranscriptionErrorCode = "empty_input" | "unsupported_format" | "missing_config" | "api_error";

export class TranscriptionError extends Error {
  code: TranscriptionErrorCode;

  constructor(code: TranscriptionErrorCode, message: string) {
    super(message);
    this.name = "TranscriptionError";
    this.code = code;
  }
}

// "audio/webm;codecs=opus" -> "audio/webm"
function baseMimeType(type: string): string {
  return type.split(";")[0].trim().toLowerCase();
}

function extensionFor(type: string): string | undefined {
  const base = baseMimeType(type);
  return Object.prototype.hasOwnProperty.call(EXTENSIONS, base) ? EXTENSIONS[base] : undefined;
}

export function isSupportedAudioType(type: string): boolean {
  return extensionFor(type) !== undefined;
}

// The audio is only ever held in memory for the length of this request and
// forwarded to the provider -- never written to disk, Supabase, or logs.
export async function transcribeAudio(audio: Blob): Promise<string> {
  if (audio.size === 0) {
    throw new TranscriptionError("empty_input", "Audio is empty.");
  }

  const extension = extensionFor(audio.type);
  if (!extension) {
    throw new TranscriptionError("unsupported_format", `Unsupported audio type: ${audio.type || "(none)"}.`);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new TranscriptionError("missing_config", "OPENAI_API_KEY is not configured.");
  }

  const client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS });

  try {
    const file = await toFile(audio, `recording.${extension}`, { type: baseMimeType(audio.type) });
    const transcription = await client.audio.transcriptions.create({ file, model: MODEL });
    return transcription.text.trim();
  } catch (err) {
    throw new TranscriptionError(
      "api_error",
      err instanceof Error ? err.message : "OpenAI request failed."
    );
  }
}
