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
  Download,
  FileAudio,
  Languages,
  Loader2,
  MessageSquare,
  Mic,
  RotateCcw,
  Square,
} from "lucide-react";
import { ERROR_MESSAGES } from "../constants/messages";
import { useLocale } from "../context/LocaleContext";
import { formatRecordingTime } from "../hooks/useAudioRecorder";
import type { Status } from "../types";
import {
  AUDIO_FILE_INPUT_ACCEPT,
  isSupportedAudioFile,
  SUPPORTED_AUDIO_FORMATS_LABEL,
} from "../utils/audioFormats";
import { cn } from "../utils/cn";
import { Button, Card, IconButton, StatusPanel } from "./ui";

interface TranscribeSectionProps {
  status: Status;
  setStatus: Dispatch<SetStateAction<Status>>;
  progress: string;
  transcription: string;
  setTranscription: Dispatch<SetStateAction<string>>;
  setError: Dispatch<SetStateAction<string>>;
  processAudio: (file: File) => Promise<void>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  elapsedSeconds: number;
  deepLKeyConfigured: boolean;
  onResetTranslation: () => void;
  onTranslateResult: () => void;
  onChatAboutThis: () => void;
}

export function TranscribeSection({
  status,
  setStatus,
  progress,
  transcription,
  setTranscription,
  setError,
  processAudio,
  startRecording,
  stopRecording,
  elapsedSeconds,
  deepLKeyConfigured,
  onResetTranslation,
  onTranslateResult,
  onChatAboutThis,
}: TranscribeSectionProps) {
  const { copy } = useLocale();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const visualizerBars = useMemo(() => Array.from({ length: 8 }, (_, index) => index), []);

  useEffect(
    () => () => {
      if (copyFeedbackTimeoutRef.current) clearTimeout(copyFeedbackTimeoutRef.current);
    },
    [],
  );

  const processSelectedFile = async (file: File) => {
    if (!isSupportedAudioFile(file)) {
      setError(ERROR_MESSAGES.invalidAudioFile);
      setStatus("error");
      return;
    }
    await processAudio(file);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await processSelectedFile(file);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) await processSelectedFile(file);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setIsCopied(true);
      if (copyFeedbackTimeoutRef.current) clearTimeout(copyFeedbackTimeoutRef.current);
      copyFeedbackTimeoutRef.current = setTimeout(() => setIsCopied(false), 1500);
    } catch (err: unknown) {
      console.error("[TranscribeSection] Error copying transcription:", err);
      setError(ERROR_MESSAGES.clipboardCopyFailed);
    }
  };

  const downloadText = () => {
    const url = URL.createObjectURL(new Blob([transcription], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "transcription.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const startOver = () => {
    setStatus("idle");
    setTranscription("");
    setError("");
    onResetTranslation();
  };

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-primary">Mistral AI</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          {copy.transcribe.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-on-surface-variant">{copy.transcribe.subtitle}</p>
      </header>

      {(status === "idle" || status === "error") && (
        <div className="grid gap-5 md:grid-cols-2">
          <Card
            variant="elevated"
            role="button"
            tabIndex={0}
            aria-label={copy.transcribe.upload}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(event) => void handleDrop(event)}
            className={cn(
              "group flex min-h-64 cursor-pointer flex-col items-start justify-between border border-transparent p-7 transition-[border,transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[var(--sf-elevation-3)]",
              isDragOver && "border-primary bg-primary-container/40",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={AUDIO_FILE_INPUT_ACCEPT}
              onChange={(event) => void handleFileUpload(event)}
              className="hidden"
            />
            <span className="flex size-14 items-center justify-center rounded-[var(--sf-shape-lg)] bg-primary-container text-on-primary-container">
              <FileAudio className="size-7" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-on-surface">{copy.transcribe.upload}</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                {isDragOver ? copy.transcribe.dropHint : copy.transcribe.uploadHint}
              </p>
              <p className="mt-4 text-xs font-bold text-primary">
                {copy.transcribe.formats(SUPPORTED_AUDIO_FORMATS_LABEL)}
              </p>
            </div>
          </Card>

          <Card variant="elevated" className="flex min-h-64 flex-col items-start justify-between p-7">
            <span className="flex size-14 items-center justify-center rounded-[var(--sf-shape-lg)] bg-secondary-container text-on-secondary-container">
              <Mic className="size-7" aria-hidden="true" />
            </span>
            <div className="w-full">
              <h2 className="text-xl font-extrabold text-on-surface">{copy.transcribe.record}</h2>
              <p className="mt-2 text-sm text-on-surface-variant">{copy.transcribe.recordHint}</p>
              <Button
                className="mt-5"
                variant="tonal"
                leadingIcon={Mic}
                onClick={() => void startRecording()}
              >
                {copy.transcribe.record}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {status === "recording" && (
        <StatusPanel
          icon={Mic}
          title={copy.transcribe.recording}
          description={copy.transcribe.recordingHint}
          live="polite"
        >
          <p className="font-mono text-3xl font-extrabold tabular-nums text-on-surface">
            {formatRecordingTime(elapsedSeconds)}
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {copy.transcribe.elapsed(formatRecordingTime(elapsedSeconds))}
          </p>
          <div className="audio-visualizer my-6" aria-hidden="true">
            {visualizerBars.map((bar) => (
              <span key={bar} className="audio-visualizer-bar" style={{ animationDelay: `${bar * 0.11}s` }} />
            ))}
          </div>
          <Button variant="danger" leadingIcon={Square} onClick={() => void stopRecording()}>
            {copy.transcribe.stop}
          </Button>
        </StatusPanel>
      )}

      {(status === "processing" || status === "transcribing") && (
        <StatusPanel
          icon={Loader2}
          title={copy.transcribe.processing}
          description={progress}
          live="polite"
        />
      )}

      {status === "done" && (
        <Card variant="elevated" className="overflow-hidden">
          <div className="flex items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-high px-5 py-4 sm:px-7">
            <h2 className="text-lg font-extrabold text-on-surface">{copy.transcribe.result}</h2>
            <div className="flex items-center gap-1">
              <IconButton
                aria-label={isCopied ? copy.common.copied : copy.common.copy}
                onClick={() => void copyToClipboard()}
              >
                {isCopied ? <Check className="size-5" /> : <Copy className="size-5" />}
              </IconButton>
              <IconButton aria-label={copy.common.download} onClick={downloadText}>
                <Download className="size-5" />
              </IconButton>
            </div>
          </div>
          <div className="p-5 sm:p-7">
            <textarea
              aria-label={copy.transcribe.result}
              className="min-h-80 w-full resize-y rounded-[var(--sf-shape-lg)] border border-outline-variant bg-surface p-5 leading-7 text-on-surface focus:border-primary"
              value={transcription}
              onChange={(event) => setTranscription(event.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 border-t border-outline-variant bg-surface-container-high px-5 py-4 sm:px-7">
            <Button variant="text" leadingIcon={RotateCcw} onClick={startOver}>
              {copy.transcribe.newTranscription}
            </Button>
            <div className="flex-1" />
            <Button
              variant={deepLKeyConfigured ? "tonal" : "outlined"}
              leadingIcon={Languages}
              onClick={onTranslateResult}
            >
              {copy.transcribe.translateResult}
            </Button>
            <Button variant="tonal" leadingIcon={MessageSquare} onClick={onChatAboutThis}>
              {copy.transcribe.chatAbout}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
