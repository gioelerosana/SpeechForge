import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from "react";
import {
  Check,
  Copy,
  FileAudio,
  Languages,
  Loader2,
  MessageSquare,
  Mic,
  Save,
  StopCircle,
} from "lucide-react";
import { ERROR_MESSAGES } from "../constants/messages";
import type { Status } from "../types";
import {
  AUDIO_FILE_INPUT_ACCEPT,
  isSupportedAudioFile,
  SUPPORTED_AUDIO_FORMATS_LABEL,
} from "../utils/audioFormats";
import { cn } from "../utils/cn";

interface TranscribeSectionProps {
  apiKey: string;
  status: Status;
  setStatus: Dispatch<SetStateAction<Status>>;
  progress: string;
  transcription: string;
  setTranscription: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
  processAudio: (file: File) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  deepLKeyConfigured: boolean;
  onResetTranslation: () => void;
  onTranslateResult: () => void;
  onChatAboutThis: () => void;
}

export function TranscribeSection({
  apiKey,
  status,
  setStatus,
  progress,
  transcription,
  setTranscription,
  setError,
  processAudio,
  startRecording,
  stopRecording,
  deepLKeyConfigured,
  onResetTranslation,
  onTranslateResult,
  onChatAboutThis,
}: TranscribeSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const visualizerBars = useMemo(
    () => Array.from({ length: 8 }, (_, index) => index),
    [],
  );

  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";

    if (!isSupportedAudioFile(file)) {
      setError(ERROR_MESSAGES.invalidAudioFile);
      setStatus("error");
      return;
    }

    await processAudio(file);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (!isSupportedAudioFile(file)) {
      setError(ERROR_MESSAGES.invalidAudioFile);
      setStatus("error");
      return;
    }

    await processAudio(file);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setIsCopied(true);
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
      copyFeedbackTimeoutRef.current = setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    } catch (err: unknown) {
      console.error(
        "[TranscribeSection] Error copying transcription to clipboard:",
        err,
      );
      setError(ERROR_MESSAGES.clipboardCopyFailed);
    }
  };

  const downloadText = () => {
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "transcription.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
          <>
            {/* Input Area */}
            {(status === "idle" || status === "error") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upload */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "group bg-[var(--md-sys-color-surface-container)] p-8 rounded-[28px] shadow-[0_4px_18px_rgba(27,34,57,0.10)] border border-[color:var(--md-sys-color-outline)]/30 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(39,80,196,0.22)] transition-all cursor-pointer flex flex-col items-center justify-center h-64 outline-none",
                    isDragOver &&
                      "ring-4 ring-[var(--md-sys-color-primary)]/35 border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]/25",
                  )}
                  aria-label="Upload audio file"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={AUDIO_FILE_INPUT_ACCEPT}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-16 h-16 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileAudio className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--md-sys-color-on-surface)]">
                    Upload Audio
                  </h3>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] text-center mt-2 text-sm">
                    {isDragOver
                      ? "Drop your audio file here"
                      : `Click or drag and drop (${SUPPORTED_AUDIO_FORMATS_LABEL})`}
                  </p>
                </div>

                {/* Record */}
                <button
                  onClick={startRecording}
                  className="group bg-[var(--md-sys-color-surface-container)] p-8 rounded-[28px] shadow-[0_4px_18px_rgba(27,34,57,0.10)] border border-[color:var(--md-sys-color-outline)]/30 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(176,54,74,0.24)] transition-all cursor-pointer flex flex-col items-center justify-center h-64"
                >
                  <div className="w-16 h-16 bg-rose-200/80 dark:bg-rose-900/45 text-rose-700 dark:text-rose-300 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Mic className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[var(--md-sys-color-on-surface)]">
                    Record Voice
                  </h3>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] text-center mt-2 text-sm">
                    Tap to start recording
                  </p>
                </button>
              </div>
            )}

            {/* Recording State */}
            {status === "recording" && (
              <div className="flex flex-col items-center justify-center py-12 bg-[var(--md-sys-color-surface-container)] rounded-[32px] shadow-[0_8px_24px_rgba(60,20,31,0.18)] border border-rose-300/30">
                <div className="w-20 h-20 bg-rose-600 rounded-[24px] flex items-center justify-center mb-6 shadow-lg shadow-rose-300/40 dark:shadow-none">
                  <Mic className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-[var(--md-sys-color-on-surface)] mb-2">
                  Recording...
                </h2>
                <p className="text-[var(--md-sys-color-on-surface-variant)] mb-8">
                  Speak clearly into the microphone
                </p>
                <div className="audio-visualizer mb-8" aria-hidden="true">
                  {visualizerBars.map((bar) => (
                    <span
                      key={bar}
                      className="audio-visualizer-bar"
                      style={{ animationDelay: `${bar * 0.11}s` }}
                    />
                  ))}
                </div>
                <button
                  onClick={stopRecording}
                  className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-rose-700 flex items-center gap-2 shadow-md transition-all hover:scale-105"
                >
                  <StopCircle className="w-5 h-5" /> Stop Recording
                </button>
              </div>
            )}

            {/* Processing State */}
            {(status === "processing" || status === "transcribing") && (
              <div className="flex flex-col items-center justify-center py-12 bg-[var(--md-sys-color-surface-container)] rounded-[32px] border border-[color:var(--md-sys-color-outline)]/30 shadow-[0_8px_24px_rgba(39,80,196,0.14)]">
                <Loader2 className="w-12 h-12 text-[var(--md-sys-color-primary)] animate-spin mb-6" />
                <h2 className="text-2xl font-extrabold text-[var(--md-sys-color-on-surface)] mb-2">
                  Processing Audio
                </h2>
                <p className="text-[var(--md-sys-color-on-surface-variant)] text-lg">
                  {progress}
                </p>
              </div>
            )}

            {/* Result State */}
            {status === "done" && (
              <div className="bg-[var(--md-sys-color-surface-container)] rounded-[30px] shadow-[0_8px_24px_rgba(27,34,57,0.10)] border border-[color:var(--md-sys-color-outline)]/30 overflow-hidden">
                <div className="bg-[var(--md-sys-color-surface-container-high)] px-6 py-4 border-b border-[color:var(--md-sys-color-outline)]/30 flex justify-between items-center">
                  <h3 className="font-bold text-[var(--md-sys-color-on-surface)]">
                    Transcription Result
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={copyToClipboard}
                      className={cn(
                        "p-2.5 hover:bg-[var(--md-sys-color-surface-container-highest)] rounded-xl transition-colors",
                        isCopied
                          ? "text-[var(--md-sys-color-primary)]"
                          : "text-[var(--md-sys-color-on-surface-variant)]",
                      )}
                      title={isCopied ? "Copied" : "Copy"}
                      aria-label={
                        isCopied ? "Copied to clipboard" : "Copy to clipboard"
                      }
                    >
                      {isCopied ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Copy className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={downloadText}
                      className="p-2.5 hover:bg-[var(--md-sys-color-surface-container-highest)] rounded-xl text-[var(--md-sys-color-on-surface-variant)]"
                      title="Save"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <textarea
                    className="w-full h-96 p-4 rounded-2xl text-on-surface bg-surface leading-relaxed outline-none resize-none border border-outline/20 focus:ring-2 focus:ring-primary/20 transition-all"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                  />
                </div>
                <div className="bg-[var(--md-sys-color-surface-container-high)] px-6 py-4 border-t border-[color:var(--md-sys-color-outline)]/30 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setStatus("idle");
                      onResetTranslation();
                    }}
                    className="text-[var(--md-sys-color-primary)] font-bold hover:opacity-80"
                  >
                    Transcribe Another File
                  </button>
                  {/* 7.5 — Translate result CTA */}
                  <button
                    onClick={onTranslateResult}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all",
                      deepLKeyConfigured
                        ? "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] hover:opacity-90"
                        : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:opacity-80",
                    )}
                    title={
                      deepLKeyConfigured
                        ? "Translate with DeepL"
                        : "Add a DeepL API key in Settings to translate"
                    }
                  >
                    <Languages className="w-4 h-4" />
                    Translate result
                  </button>

                  {/* 7.6 — Chat about this CTA */}
                  <button
                    onClick={onChatAboutThis}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all",
                      apiKey
                        ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] hover:opacity-90"
                        : "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] hover:opacity-80",
                    )}
                    title={
                      apiKey
                        ? "Chat with Mistral about this transcript"
                        : "Add a Mistral API key in Settings to chat"
                    }
                  >
                    <MessageSquare className="w-4 h-4" />
                    Chat about this
                  </button>
                </div>
              </div>
            )}
          </>
  );
}

