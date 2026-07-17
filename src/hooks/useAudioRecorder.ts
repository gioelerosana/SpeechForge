import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  ERROR_MESSAGES,
  formatMicrophoneAccessError,
  formatNativeMicrophoneError,
} from "../constants/messages";
import type { Status } from "../types";
import { isTauriRuntime } from "../utils/platform";

interface UseAudioRecorderOptions {
  status: Status;
  setStatus: (status: Status) => void;
  setProgress: (progress: string) => void;
  setError: (message: string) => void;
  processAudio: (file: File) => Promise<void>;
}

function isLinuxPlatform(): boolean {
  return typeof navigator !== "undefined" && /linux/i.test(navigator.userAgent);
}

export function shouldUseNativeRecorder(
  tauriEnv: boolean,
  linuxEnv: boolean,
): boolean {
  return tauriEnv && linuxEnv;
}

export function getRecordingFileExtension(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "mp4";
  return "webm";
}

function getErrorProperty(err: unknown, property: "name" | "message") {
  if (!err || typeof err !== "object" || !(property in err)) return undefined;
  const value = (err as Record<string, unknown>)[property];
  return typeof value === "string" ? value : undefined;
}

function getRecordingErrorMessage(
  err: unknown,
  context: { tauriEnv: boolean; linuxEnv: boolean },
): string {
  const name = getErrorProperty(err, "name");
  const message = getErrorProperty(err, "message");
  const isLinuxTauri = context.tauriEnv && context.linuxEnv;

  if (
    name === "NotAllowedError" ||
    message?.toLowerCase().includes("permission denied")
  ) {
    return isLinuxTauri
      ? ERROR_MESSAGES.tauriLinuxPermissionDenied
      : ERROR_MESSAGES.microphonePermissionDenied;
  }
  if (name === "NotFoundError") return ERROR_MESSAGES.noMicrophoneDetected;
  if (name === "NotReadableError") return ERROR_MESSAGES.microphoneBusy;
  if (name === "SecurityError") return ERROR_MESSAGES.secureContextRequired;

  return formatMicrophoneAccessError(
    name || ERROR_MESSAGES.unknownError,
    message || ERROR_MESSAGES.noErrorDetails,
  );
}

function getErrorDetails(err: unknown): string {
  if (typeof err === "string") return err;
  const message = getErrorProperty(err, "message");
  if (message) return message;
  if (err && typeof err === "object") {
    try {
      return JSON.stringify(err);
    } catch {
      return ERROR_MESSAGES.unknownError;
    }
  }
  return ERROR_MESSAGES.unknownError;
}

export function useAudioRecorder({
  status,
  setStatus,
  setProgress,
  setError,
  processAudio,
}: UseAudioRecorderOptions) {
  const [tauriEnv, setTauriEnv] = useState(() => isTauriRuntime());
  const [linuxEnv, setLinuxEnv] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaMimeTypeRef = useRef("audio/webm");
  const chunksRef = useRef<Blob[]>([]);
  const processAudioRef = useRef(processAudio);

  useEffect(() => {
    processAudioRef.current = processAudio;
  }, [processAudio]);

  useEffect(() => {
    setTauriEnv(isTauriRuntime());
    setLinuxEnv(isLinuxPlatform());
  }, []);

  const cleanupRecording = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (err: unknown) {
        console.error("[useAudioRecorder] Error stopping media recorder:", err);
      }
    }

    if (isTauriRuntime() && isLinuxPlatform()) {
      void invoke("stop_native_recording").catch(() => {
        // Ignore cleanup errors.
      });
    }
  }, []);

  useEffect(() => cleanupRecording, [cleanupRecording]);

  const startRecording = useCallback(async () => {
    if (shouldUseNativeRecorder(tauriEnv, linuxEnv)) {
      try {
        setError("");
        await invoke("start_native_recording");
        setStatus("recording");
      } catch (err: unknown) {
        console.error("[useAudioRecorder] Error starting native recording:", err);
        setError(formatNativeMicrophoneError(getErrorDetails(err)));
        setStatus("error");
      }
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(ERROR_MESSAGES.recordingNotSupported);
      setStatus("error");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setError(ERROR_MESSAGES.mediaRecorderNotAvailable);
      setStatus("error");
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log(
        "[useAudioRecorder] Available devices:",
        devices.map((device) => `${device.kind}: ${device.label}`),
      );
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeTypeCandidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ];
      const selectedMimeType = mimeTypeCandidates.find((candidate) =>
        MediaRecorder.isTypeSupported(candidate),
      );
      const mediaRecorder = selectedMimeType
        ? new MediaRecorder(stream, { mimeType: selectedMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      mediaMimeTypeRef.current = selectedMimeType ?? "audio/webm";
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const mimeType = mediaMimeTypeRef.current;
        const extension = getRecordingFileExtension(mimeType);
        const file = new File(
          [new Blob(chunksRef.current, { type: mimeType })],
          `recording.${extension}`,
          { type: mimeType },
        );
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        await processAudioRef.current(file);
      };

      mediaRecorder.start();
      setStatus("recording");
    } catch (err: unknown) {
      console.error("[useAudioRecorder] Error starting recording:", err);
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setError(getRecordingErrorMessage(err, { tauriEnv, linuxEnv }));
      setStatus("error");
    }
  }, [linuxEnv, setError, setStatus, tauriEnv]);

  const stopRecording = useCallback(async () => {
    if (status !== "recording") return;

    if (shouldUseNativeRecorder(tauriEnv, linuxEnv)) {
      try {
        setStatus("processing");
        setProgress("Finalizing native recording...");
        const audioBytes = await invoke<number[]>("stop_native_recording");
        const file = new File(
          [Uint8Array.from(audioBytes)],
          "recording.wav",
          { type: "audio/wav" },
        );
        await processAudioRef.current(file);
      } catch (err: unknown) {
        console.error("[useAudioRecorder] Error stopping native recording:", err);
        setError(formatNativeMicrophoneError(getErrorDetails(err)));
        setProgress("");
        setStatus("error");
      }
      return;
    }

    mediaRecorderRef.current?.stop();
  }, [linuxEnv, setError, setProgress, setStatus, status, tauriEnv]);

  return { tauriEnv, startRecording, stopRecording, cleanupRecording };
}
