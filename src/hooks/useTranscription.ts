import { useCallback, useState } from "react";
import { ERROR_MESSAGES } from "../constants/messages";
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
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState("");
  const [transcription, setTranscription] = useState("");

  const processAudio = useCallback(
    async (file: File) => {
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
        setProgress("Analyzing audio...");

        const duration = await audioProcessor.getAudioDuration(file);
        console.log(`[useTranscription] Audio Duration: ${duration}s`);

        const client = new MistralClient(apiKey);
        const results: string[] = [];

        if (duration > 900) {
          setProgress("Splitting long audio file...");
          const chunks = await audioProcessor.splitAudio(file);
          console.log(`[useTranscription] Split into ${chunks.length} chunks`);

          setStatus("transcribing");
          for (let index = 0; index < chunks.length; index += 1) {
            setProgress(`Transcribing chunk ${index + 1} of ${chunks.length}...`);
            const chunk = chunks[index];
            if (!chunk) continue;
            results.push(await client.transcribe(chunk));
          }
        } else {
          setProgress("Normalizing audio...");
          const normalizedBlob = await audioProcessor.normalizeAudio(file);
          setStatus("transcribing");
          setProgress("Sending to Mistral AI...");
          results.push(await client.transcribe(normalizedBlob));
        }

        setTranscription(results.join(" "));
        setStatus("done");
        setProgress("");
        onTranscriptionComplete();
      } catch (err: unknown) {
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
  };
}
