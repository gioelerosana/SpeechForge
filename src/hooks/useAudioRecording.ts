import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { isTauriRuntime } from "../utils/platform";
import {
  ERROR_MESSAGES,
  formatNativeMicrophoneError,
} from "../constants/messages";
import { getRecordingErrorMessage, getErrorDetails } from "../utils/errors";

function isLinuxPlatform(): boolean {
  return typeof navigator !== "undefined" && /linux/i.test(navigator.userAgent);
}

interface UseAudioRecordingProps {
  onRecordingStart?: () => void;
  onNativeFinalizing?: (msg: string) => void;
  onRecordingComplete: (file: File) => Promise<void>;
  onError: (msg: string) => void;
}

export function useAudioRecording({
  onRecordingStart,
  onNativeFinalizing,
  onRecordingComplete,
  onError,
}: UseAudioRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [tauriEnv, setTauriEnv] = useState(() => isTauriRuntime());
  const [linuxEnv, setLinuxEnv] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaMimeTypeRef = useRef("audio/webm");
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setTauriEnv(isTauriRuntime());
    setLinuxEnv(isLinuxPlatform());

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;

      if (isTauriRuntime() && isLinuxPlatform()) {
        void invoke("stop_native_recording").catch(() => {
          // Ignore cleanup errors
        });
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    const useNativeRecorder = tauriEnv && linuxEnv;

    if (useNativeRecorder) {
      try {
        onError("");
        console.log("[useAudioRecording] Starting native microphone recording...");
        await invoke("start_native_recording");
        setIsRecording(true);
        onRecordingStart?.();
      } catch (err: unknown) {
        console.error("[useAudioRecording] Error starting native recording:", err);
        onError(formatNativeMicrophoneError(getErrorDetails(err)));
        setIsRecording(false);
      }
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      onError(ERROR_MESSAGES.recordingNotSupported);
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      onError(ERROR_MESSAGES.mediaRecorderNotAvailable);
      return;
    }

    try {
      console.log("[useAudioRecording] Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[useAudioRecording] Microphone access granted");
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

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaMimeTypeRef.current;
        let extension = "webm";
        if (mimeType.includes("ogg")) {
          extension = "ogg";
        } else if (mimeType.includes("mp4")) {
          extension = "mp4";
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });
        const file = new File([blob], `recording.${extension}`, {
          type: mimeType,
        });

        // Clean up stream immediately to turn off recording LED
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;

        await onRecordingComplete(file);
      };

      mediaRecorder.start();
      setIsRecording(true);
      onRecordingStart?.();
    } catch (err: unknown) {
      console.error("[useAudioRecording] Error starting recording:", err);
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      onError(getRecordingErrorMessage(err, { tauriEnv, linuxEnv }));
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!isRecording) return;

    setIsRecording(false);
    const useNativeRecorder = tauriEnv && linuxEnv;

    if (useNativeRecorder) {
      try {
        onNativeFinalizing?.("Finalizing native recording...");
        const audioBytes = await invoke<number[]>("stop_native_recording");
        const audioData = Uint8Array.from(audioBytes);
        const file = new File([audioData], "recording.wav", {
          type: "audio/wav",
        });
        await onRecordingComplete(file);
      } catch (err: unknown) {
        console.error("[useAudioRecording] Error stopping native recording:", err);
        onError(formatNativeMicrophoneError(getErrorDetails(err)));
      }
      return;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    tauriEnv,
    linuxEnv,
  };
}
