// Shared by the Quick Capture transcription route and the client that calls
// it. Same wording as SESSION_EXPIRED_MESSAGE in app/quick-capture/actions.ts:
// points the user at a new tab so signing back in doesn't navigate away from
// (and discard) the note still on screen.
export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Sign in again in a new tab, then come back to this tab and try again — nothing here has been lost.";
