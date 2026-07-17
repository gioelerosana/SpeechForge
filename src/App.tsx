import { useCallback, useEffect, useRef, useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { ExternalLink } from "lucide-react";
import { AppHeader } from "./components/AppHeader";
import { ChatSection } from "./components/ChatSection";
import { ErrorBanner } from "./components/ErrorBanner";
import { SettingsPanel } from "./components/SettingsPanel";
import { TitleBar } from "./components/TitleBar";
import { TranscribeSection } from "./components/TranscribeSection";
import { TranslationCard } from "./components/TranslationCard";
import { useTheme } from "./context/ThemeContext";
import { useApiKeySettings } from "./hooks/useApiKeySettings";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useTranscription } from "./hooks/useTranscription";
import type { ActiveTab } from "./types";
import { cn } from "./utils/cn";
import { isCapacitorRuntime } from "./utils/platform";
import pkg from "../package.json";

export default function App() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<ActiveTab>("transcribe");
  const [showLogoMenu, setShowLogoMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [translationInitialText, setTranslationInitialText] = useState("");
  const [error, setError] = useState("");
  const translationCardRef = useRef<HTMLDivElement | null>(null);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const settings = useApiKeySettings({
    onError: setError,
    onOpenSettings: openSettings,
  });
  const { invalidateMistralApiKey } = settings;

  const handleMissingApiKey = useCallback(() => {
    invalidateMistralApiKey();
    setShowSettings(true);
  }, [invalidateMistralApiKey]);

  const handleInvalidApiKey = useCallback(() => {
    invalidateMistralApiKey();
    setShowSettings(true);
  }, [invalidateMistralApiKey]);

  const handleTranscriptionComplete = useCallback(() => {
    setTranslationInitialText("");
  }, []);

  const transcription = useTranscription({
    apiKey: settings.apiKey,
    onError: setError,
    onMissingApiKey: handleMissingApiKey,
    onInvalidApiKey: handleInvalidApiKey,
    onTranscriptionComplete: handleTranscriptionComplete,
  });

  const recorder = useAudioRecorder({
    status: transcription.status,
    setStatus: transcription.setStatus,
    setProgress: transcription.setProgress,
    setError,
    processAudio: transcription.processAudio,
  });
  const { cleanupRecording } = recorder;
  const { setStatus, setTranscription } = transcription;

  const handleGoHome = useCallback(() => {
    setActiveTab("transcribe");
    setStatus("idle");
    setTranscription("");
    setError("");
    setTranslationInitialText("");
    setShowLogoMenu(false);
    cleanupRecording();
  }, [cleanupRecording, setStatus, setTranscription]);

  useEffect(() => {
    if (!isCapacitorRuntime()) return;

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return;
      }
      event.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);

    const backButtonListenerPromise = CapApp.addListener("backButton", () => {
      if (showSettings) {
        setShowSettings(false);
      } else if (showLogoMenu) {
        setShowLogoMenu(false);
      } else if (
        activeTab === "translate" ||
        activeTab === "chat" ||
        transcription.status !== "idle" ||
        transcription.transcription !== ""
      ) {
        handleGoHome();
      } else {
        void CapApp.exitApp();
      }
    });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      void backButtonListenerPromise.then((listener) => listener.remove());
    };
  }, [
    activeTab,
    handleGoHome,
    showLogoMenu,
    showSettings,
    transcription.status,
    transcription.transcription,
  ]);

  const handleTranslateResult = useCallback(() => {
    setTranslationInitialText(transcription.transcription);
    setActiveTab("translate");
    requestAnimationFrame(() => {
      translationCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [transcription.transcription]);

  const handleChatAboutThis = useCallback(() => {
    setActiveTab("chat");
  }, []);

  const deepLKeyConfigured = settings.deepLApiKey.trim().length > 0;

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] transition-colors duration-200 relative overflow-x-hidden",
        recorder.tauriEnv && "pt-8",
      )}
    >
      <div className="pointer-events-none absolute top-16 -left-10 h-56 w-56 rounded-full bg-[var(--md-sys-color-primary-container)]/20 blur-3xl" />
      <div className="pointer-events-none absolute top-40 right-0 h-64 w-64 rounded-full bg-[var(--md-sys-color-secondary-container)]/15 blur-3xl" />
      <TitleBar />

      <AppHeader
        theme={resolvedTheme}
        toggleTheme={toggleTheme}
        tauriEnv={recorder.tauriEnv}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showLogoMenu={showLogoMenu}
        setShowLogoMenu={setShowLogoMenu}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        handleGoHome={handleGoHome}
        settingsPanel={
          <SettingsPanel
            settings={settings}
            visible={showSettings}
            onClose={() => setShowSettings(false)}
          />
        }
      />

      {!settings.isApiKeyVerified && (
        <div
          className={cn(
            "relative z-[1] mb-6 flex justify-center px-4 sm:px-6",
            recorder.tauriEnv ? "mt-2" : "-mt-8",
          )}
        >
          <a
            href="https://console.mistral.ai/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--md-sys-color-outline)]/30 bg-[var(--md-sys-color-secondary-container)] px-5 py-3 text-sm font-bold text-[var(--md-sys-color-on-secondary-container)] shadow-[0_10px_24px_rgba(22,27,45,0.16)] hover:-translate-y-0.5 hover:opacity-95 transition-all"
          >
            <span>Get your Mistral API Key</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

      <main className="relative flex-1 w-full max-w-4xl mx-auto px-6 pb-6 space-y-8">
        <ErrorBanner message={error} />

        {activeTab === "transcribe" && (
          <TranscribeSection
            apiKey={settings.apiKey}
            status={transcription.status}
            setStatus={transcription.setStatus}
            progress={transcription.progress}
            transcription={transcription.transcription}
            setTranscription={transcription.setTranscription}
            setError={setError}
            processAudio={transcription.processAudio}
            startRecording={recorder.startRecording}
            stopRecording={recorder.stopRecording}
            deepLKeyConfigured={deepLKeyConfigured}
            onResetTranslation={() => setTranslationInitialText("")}
            onTranslateResult={handleTranslateResult}
            onChatAboutThis={handleChatAboutThis}
          />
        )}

        {activeTab === "translate" && (
          <div
            ref={translationCardRef}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <TranslationCard
              apiKey={settings.deepLApiKey}
              plan={settings.deepLPlan}
              initialText={translationInitialText}
              defaultTargetLang={settings.deepLDefaultTargetLang}
              usage={settings.deepLUsage}
            />
          </div>
        )}

        {activeTab === "chat" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ChatSection
              apiKey={settings.apiKey}
              initialContext={transcription.transcription}
            />
          </div>
        )}
      </main>

      <footer className="w-full py-6 text-center text-sm text-[var(--md-sys-color-on-surface-variant)] opacity-60">
        <p>
          Version {pkg.version} • © 2026{" "}
          <a
            href="https://jshep.xyz/profile/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-[var(--md-sys-color-primary)] transition-colors"
          >
            JoeShep
          </a>
        </p>
      </footer>
    </div>
  );
}
