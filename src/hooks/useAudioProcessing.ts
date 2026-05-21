import { useState } from "react";
import { audioProcessor } from "../services/audio/AudioProcessor";
import { MistralClient } from "../services/mistral/MistralClient";
import { ERROR_MESSAGES } from "../constants/messages";
import { useSharedFile } from "./useSharedFile";
import { type Status } from "../types";

interface UseAudioProcessingProps {
  apiKey: string;
  onApiKeyInvalid: () => void;
  onTranscriptionComplete?: (text: string) => void;
}

export function useAudioProcessing({
  apiKey,
  onApiKeyInvalid,
  onTranscriptionComplete,
}: UseAudioProcessingProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState("");
  const [transcription, setTranscription] = useState("");
  const [error, setError] = useState("");

  const processAudio = async (file: File) => {
    console.log(
      "[useAudioProcessing] Starting processAudio for file:",
      file.name,
      "size:",
      file.size,
      "type:",
      file.type,
    );

    if (!apiKey) {
      console.error("[useAudioProcessing] No API key set");
      setError(ERROR_MESSAGES.missingApiKey);
      onApiKeyInvalid();
      return;
    }

    try {
      setError("");
      setTranscription("");
      setStatus("processing");
      setProgress("Analyzing audio...");

      console.log("[useAudioProcessing] Getting audio duration...");
      const duration = await audioProcessor.getAudioDuration(file);
      console.log(`[useAudioProcessing] Audio Duration: ${duration}s`);

      const client = new MistralClient(apiKey);
      const results: string[] = [];

      if (duration > 900) {
        console.log("[useAudioProcessing] File exceeds 15 minutes, splitting...");
        setProgress("Splitting long audio file...");
        const chunks = await audioProcessor.splitAudio(file);
        console.log(`[useAudioProcessing] Split into ${chunks.length} chunks`);

        setStatus("transcribing");
        for (let i = 0; i < chunks.length; i++) {
          console.log(`[useAudioProcessing] Transcribing chunk ${i + 1}/${chunks.length}...`);
          setProgress(`Transcribing chunk ${i + 1} of ${chunks.length}...`);
          const text = await client.transcribe(chunks[i]!);
          console.log(
            `[useAudioProcessing] Chunk ${i + 1} transcribed, length: ${text.length} chars`,
          );
          results.push(text);
        }
      } else {
        console.log("[useAudioProcessing] File under 15 minutes, normalizing...");
        setProgress("Normalizing audio...");
        const normalizedBlob = await audioProcessor.normalizeAudio(file);
        console.log("[useAudioProcessing] Normalized blob size:", normalizedBlob.size);

        setStatus("transcribing");
        setProgress("Sending to Mistral AI...");
        console.log("[useAudioProcessing] Sending to Mistral API...");
        const text = await client.transcribe(normalizedBlob);
        console.log(
          "[useAudioProcessing] Transcription received, length:",
          text.length,
          "chars",
        );
        results.push(text);
      }

      const fullTranscription = results.join(" ");
      console.log(
        "[useAudioProcessing] Full transcription length:",
        fullTranscription.length,
        "chars",
      );
      setTranscription(fullTranscription);
      setStatus("done");
      setProgress("");
      onTranscriptionComplete?.(fullTranscription);
      console.log("[useAudioProcessing] Process complete ✓");
    } catch (err: unknown) {
      console.error("[useAudioProcessing] Error during processing:", err);

      const errMsg = err instanceof Error ? err.message : String(err);
      let errorMessage = errMsg || ERROR_MESSAGES.processingFailed;

      if (
        errorMessage.includes("401") ||
        errorMessage.toLowerCase().includes("unauthorized")
      ) {
        errorMessage = ERROR_MESSAGES.invalidApiKey;
        onApiKeyInvalid();
      }

      setError(errorMessage);
      setStatus("error");
      setProgress("");
    }
  };

  // Register intent share hook
  useSharedFile(processAudio);

  return {
    status,
    setStatus,
    progress,
    setProgress,
    transcription,
    setTranscription,
    error,
    setError,
    processAudio,
  };
}
