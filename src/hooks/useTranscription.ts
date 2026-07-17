import { useCallback, useEffect, useRef, useState } from "react";
import { ERROR_MESSAGES } from "../constants/messages";
import { useLocale } from "../context/LocaleContext";
import { audioProcessor } from "../services/audio/AudioProcessor";
import { MistralClient } from "../services/mistral/MistralClient";
import type { Status } from "../types";
import { useSharedFile } from "./useSharedFile";

interface UseTranscriptionOptions {
  apiKey: string;
  onError: (message: string) => void;
  onMissingApiKey: () => void;
  onInvalidApiKey: () => void;
  onTranscriptionComplete: () => void;
}

function getErrorMessage(err: unknown): string {
  return err instanceof Error && err.message
    ? err.message
    : ERROR_MESSAGES.processingFailed;
}

export function useTranscription({
  apiKey,
  onError,
  onMissingApiKey,
  onInvalidApiKey,
  onTranscriptionComplete,
}: UseTranscriptionOptions) {
  const { copy } = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState("");
  const [transcription, setTranscription] = useState("");
  const runIdRef = useRef(0);

  const cancelProcessing = useCallback(() => {
    runIdRef.current += 1;
    setProgress("");
  }, []);

  useEffect(() => cancelProcessing, [cancelProcessing]);

  const processAudio = useCallback(
    async (file: File) => {
      const runId = ++runIdRef.current;
      const isCurrent = () => runIdRef.current === runId;
      console.log(
        "[useTranscription] Starting processAudio for file:",
        file.name,
        "size:",
        file.size,
        "type:",
        file.type,
      );

      if (!apiKey) {
        console.error("[useTranscription] No API key set");
        onError(ERROR_MESSAGES.missingApiKey);
        onMissingApiKey();
        return;
      }

      try {
        onError("");
        setTranscription("");
        setStatus("processing");
        setProgress(copy.transcribe.analyzing);

        const duration = await audioProcessor.getAudioDuration(file);
        if (!isCurrent()) return;
        console.log(`[useTranscription] Audio Duration: ${duration}s`);

        const client = new MistralClient(apiKey);
        const results: string[] = [];

        if (duration > 900) {
          setProgress(copy.transcribe.splitting);
          const chunks = await audioProcessor.splitAudio(file);
          if (!isCurrent()) return;
          console.log(`[useTranscription] Split into ${chunks.length} chunks`);

          setStatus("transcribing");
          for (let index = 0; index < chunks.length; index += 1) {
            setProgress(copy.transcribe.chunk(index + 1, chunks.length));
            const chunk = chunks[index];
            if (!chunk) continue;
            const result = await client.transcribe(chunk);
            if (!isCurrent()) return;
            results.push(result);
          }
        } else {
          setProgress(copy.transcribe.normalizing);
          const normalizedBlob = await audioProcessor.normalizeAudio(file);
          if (!isCurrent()) return;
          setStatus("transcribing");
          setProgress(copy.transcribe.sending);
          const result = await client.transcribe(normalizedBlob);
          if (!isCurrent()) return;
          results.push(result);
        }

        if (!isCurrent()) return;
        setTranscription(results.join(" "));
        setStatus("done");
        setProgress("");
        onTranscriptionComplete();
      } catch (err: unknown) {
        if (!isCurrent()) return;
        console.error("[useTranscription] Error during processing:", err);
        let errorMessage = getErrorMessage(err);

        if (
          errorMessage.includes("401") ||
          errorMessage.toLowerCase().includes("unauthorized")
        ) {
          errorMessage = ERROR_MESSAGES.invalidApiKey;
          onInvalidApiKey();
        }

        onError(errorMessage);
        setStatus("error");
      }
    },
    [
      apiKey,
      copy.transcribe,
      onError,
      onInvalidApiKey,
      onMissingApiKey,
      onTranscriptionComplete,
    ],
  );

  useSharedFile(processAudio);

  return {
    status,
    setStatus,
    progress,
    setProgress,
    transcription,
    setTranscription,
    processAudio,
    cancelProcessing,
  };
}
