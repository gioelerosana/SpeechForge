import React, { useState, useEffect, useRef, useCallback } from "react";
import { ExternalLink } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { useTheme } from "./context/ThemeContext";
import { TitleBar } from "./components/TitleBar";
import { Header } from "./components/Header";
import { SettingsPanel } from "./components/SettingsPanel";
import { AudioUploader } from "./components/AudioUploader";
import { AudioRecorder } from "./components/AudioRecorder";
import { ProcessingPanel } from "./components/ProcessingPanel";
import { TranscriptionResult } from "./components/TranscriptionResult";
import { TranslationCard } from "./components/TranslationCard";
import { useAudioRecording } from "./hooks/useAudioRecording";
import { useAudioProcessing } from "./hooks/useAudioProcessing";
import pkg from "../package.json";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

function InnerApp() {
  const {
    apiKey,
    isApiKeyVerified,
    deepLApiKey,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<"transcribe" | "translate">("transcribe");
  const [showSettings, setShowSettings] = useState(false);
  const [translationInitialText, setTranslationInitialText] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  const copyFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translationCardRef = useRef<HTMLDivElement | null>(null);

  const {
    status,
    setStatus,
    progress,
    setProgress,
    transcription,
    setTranscription,
    error,
    setError,
    processAudio,
  } = useAudioProcessing({
    apiKey,
    onApiKeyInvalid: () => {
      setShowSettings(true);
    },
    onTranscriptionComplete: () => {
      setTranslationInitialText("");
    },
  });

  const {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    tauriEnv,
  } = useAudioRecording({
    onRecordingStart: () => {
      setStatus("recording");
      setError("");
    },
    onNativeFinalizing: (msg) => {
      setStatus("processing");
      setProgress(msg);
    },
    onRecordingComplete: async (file) => {
      await processAudio(file);
    },
    onError: (msg) => {
      setError(msg);
      setStatus("error");
    },
  });

  // Apply conditional class for Tauri scrollbars
  useEffect(() => {
    if (tauriEnv) {
      document.body.classList.add("is-tauri");
    } else {
      document.body.classList.remove("is-tauri");
    }
  }, [tauriEnv]);

  // Clean copy timeout
  useEffect(() => {
    return () => {
      if (copyFeedbackTimeoutRef.current) {
        clearTimeout(copyFeedbackTimeoutRef.current);
      }
    };
  }, []);

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
      console.error("[InnerApp] Error copying transcription to clipboard:", err);
      setError("Failed to copy transcription to clipboard.");
    }
  };

  const downloadText = () => {
    const blob = new Blob([transcription], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transcription.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleTranslateResult = useCallback(() => {
    setTranslationInitialText(transcription);
    setActiveTab("translate");
    // Scroll to translation card after React renders
    requestAnimationFrame(() => {
      translationCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [transcription]);

  const deepLKeyConfigured = deepLApiKey.trim().length > 0;

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-surface text-on-surface transition-colors duration-200 relative overflow-x-hidden",
        tauriEnv && "pt-8",
      )}
    >
      {/* Dynamic gradients in background */}
      <div className="pointer-events-none absolute top-16 -left-10 h-56 w-56 rounded-full bg-primary-container/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-0 h-64 w-64 rounded-full bg-secondary-container/15 blur-3xl" />

      <TitleBar />

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        tauriEnv={tauriEnv}
        status={status}
        setStatus={setStatus}
        setTranscription={setTranscription}
        setError={setError}
        setTranslationInitialText={setTranslationInitialText}
      />

      {/* API Key CTA links */}
      {!isApiKeyVerified && (
        <div
          className={cn(
            "relative z-[1] mb-6 flex justify-center px-4 sm:px-6",
            tauriEnv ? "mt-2" : "-mt-6",
          )}
        >
          <a
            href="https://console.mistral.ai/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-outline/30 bg-secondary-container px-5 py-3 text-sm font-bold text-on-secondary-container shadow-[0_10px_24px_rgba(22,27,45,0.16)] hover:-translate-y-0.5 hover:opacity-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <span>Get your Mistral API Key</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* Main content grid */}
      <main className="relative flex-1 w-full max-w-4xl mx-auto px-6 pb-6 space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-error-container text-on-error-container p-4 rounded-2xl border border-rose-300/40 flex items-center gap-2 shadow-sm animate-in slide-in-from-top-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Transcribe tab */}
        {activeTab === "transcribe" && (
          <>
            {(status === "idle" || status === "error") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                <AudioUploader
                  onFileSelected={processAudio}
                  onError={(err) => {
                    setError(err);
                    setStatus("error");
                  }}
                />

                <AudioRecorder
                  isRecording={isRecording}
                  recordingDuration={recordingDuration}
                  onStart={startRecording}
                  onStop={stopRecording}
                />
              </div>
            )}

            {status === "recording" && (
              <AudioRecorder
                isRecording={isRecording}
                recordingDuration={recordingDuration}
                onStart={startRecording}
                onStop={stopRecording}
              />
            )}

            {(status === "processing" || status === "transcribing") && (
              <ProcessingPanel progress={progress} />
            )}

            {status === "done" && (
              <TranscriptionResult
                transcription={transcription}
                onChange={setTranscription}
                onCopy={copyToClipboard}
                isCopied={isCopied}
                onDownload={downloadText}
                onReset={() => {
                  setStatus("idle");
                  setTranscription("");
                  setTranslationInitialText("");
                  setError("");
                }}
                onTranslate={handleTranslateResult}
                deepLKeyConfigured={deepLKeyConfigured}
              />
            )}
          </>
        )}

        {/* Translate tab */}
        {activeTab === "translate" && (
          <div ref={translationCardRef} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TranslationCard
              initialText={translationInitialText}
            />
          </div>
        )}
      </main>

      <footer className="w-full py-6 text-center text-sm text-on-surface-variant opacity-60">
        <p>
          Version {pkg.version} • © 2026{" "}
          <a
            href="https://jshep.xyz/profile/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-primary transition-colors outline-none focus-visible:ring-1 focus-visible:ring-primary/40 rounded"
          >
            JoeShep
          </a>
        </p>
      </footer>

      {/* Global modal settings panel */}
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <InnerApp />
    </SettingsProvider>
  );
}
