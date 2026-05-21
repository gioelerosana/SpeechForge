import { ERROR_MESSAGES, formatMicrophoneAccessError } from "../constants/messages";

interface ErrorLike {
  name?: string;
  message?: string;
}

export function getRecordingErrorMessage(
  err: unknown,
  context: { tauriEnv: boolean; linuxEnv: boolean },
): string {
  let name = "";
  let message = "";

  if (err && typeof err === "object") {
    const errObj = err as ErrorLike;
    name = errObj.name || "";
    message = errObj.message || "";
  }

  const isLinuxTauri = context.tauriEnv && context.linuxEnv;

  if (
    name === "NotAllowedError" ||
    message.toLowerCase().includes("permission denied")
  ) {
    if (isLinuxTauri) {
      return ERROR_MESSAGES.tauriLinuxPermissionDenied;
    }
    return ERROR_MESSAGES.microphonePermissionDenied;
  }
  if (name === "NotFoundError") {
    return ERROR_MESSAGES.noMicrophoneDetected;
  }
  if (name === "NotReadableError") {
    return ERROR_MESSAGES.microphoneBusy;
  }
  if (name === "SecurityError") {
    return ERROR_MESSAGES.secureContextRequired;
  }

  return formatMicrophoneAccessError(
    name || ERROR_MESSAGES.unknownError,
    message || ERROR_MESSAGES.noErrorDetails,
  );
}

export function getErrorDetails(err: unknown): string {
  if (typeof err === "string") {
    return err;
  }

  if (err && typeof err === "object") {
    const maybeMessage = (err as Record<string, unknown>).message;
    if (typeof maybeMessage === "string" && maybeMessage.length > 0) {
      return maybeMessage;
    }

    try {
      return JSON.stringify(err);
    } catch {
      return ERROR_MESSAGES.unknownError;
    }
  }

  return ERROR_MESSAGES.unknownError;
}
