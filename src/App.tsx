import { useCallback, useEffect, useRef, useState } from "react";
import { App as CapApp } from "@capacitor/app";
import { AppHeader } from "./components/AppHeader";
import { BottomNavigation } from "./components/BottomNavigation";
import { ChatSection } from "./components/ChatSection";
import { ErrorBanner } from "./components/ErrorBanner";
import { OnboardingDialog } from "./components/OnboardingDialog";
import { ProviderGate } from "./components/ProviderGate";
import { SettingsPanel } from "./components/SettingsPanel";
import { TitleBar } from "./components/TitleBar";
import { TranscribeSection } from "./components/TranscribeSection";
import { TranslationCard } from "./components/TranslationCard";
import { Button, Dialog } from "./components/ui";
import { useLocale } from "./context/LocaleContext";
import { useTheme } from "./context/ThemeContext";
import { useApiKeySettings } from "./hooks/useApiKeySettings";
import { useAudioRecorder } from "./hooks/useAudioRecorder";
import { useTranscription } from "./hooks/useTranscription";
import type { ActiveTab } from "./types";
import { cn } from "./utils/cn";
import { isCapacitorRuntime } from "./utils/platform";
import pkg from "../package.json";

const ONBOARDING_KEY = "speechforge_onboarding_state";

function shouldOpenOnboarding(): boolean {
  if (localStorage.getItem(ONBOARDING_KEY)) return false;
  return (
    localStorage.getItem("mistral_api_key_verified") !== "true" &&
    localStorage.getItem("deepl_api_key_verified") !== "true"
  );
}

export default function App() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { copy } = useLocale();
  const [activeTab, setActiveTab] = useState<ActiveTab>("transcribe");
  const [showSettings, setShowSettings] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(shouldOpenOnboarding);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [translationInitialText, setTranslationInitialText] = useState("");
  const [translationDirty, setTranslationDirty] = useState(false);
  const [chatDirty, setChatDirty] = useState(false);
  const [sessionGeneration, setSessionGeneration] = useState(0);
  const [error, setError] = useState("");
  const translationCardRef = useRef<HTMLDivElement | null>(null);

  const settings = useApiKeySettings();
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

  const sessionDirty =
    transcription.status !== "idle" ||
    Boolean(transcription.transcription.trim()) ||
    translationDirty ||
    chatDirty;

  const handleConfirmedReset = useCallback(() => {
    setActiveTab("transcribe");
    setStatus("idle");
    setTranscription("");
    setError("");
    setTranslationInitialText("");
    setTranslationDirty(false);
    setChatDirty(false);
    setSessionGeneration((generation) => generation + 1);
    setShowResetConfirmation(false);
    cleanupRecording();
  }, [cleanupRecording, setStatus, setTranscription]);

  const handleRequestHome = useCallback(() => {
    if (sessionDirty) {
      setShowResetConfirmation(true);
    } else {
      handleConfirmedReset();
    }
  }, [handleConfirmedReset, sessionDirty]);

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

    const listenerPromise = CapApp.addListener("backButton", () => {
      if (showResetConfirmation) {
        setShowResetConfirmation(false);
      } else if (showSettings) {
        setShowSettings(false);
      } else if (showOnboarding) {
        setShowOnboarding(false);
      } else if (activeTab !== "transcribe") {
        setActiveTab("transcribe");
      } else if (sessionDirty) {
        setShowResetConfirmation(true);
      } else {
        void CapApp.exitApp();
      }
    });

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      void listenerPromise.then((listener) => listener.remove());
    };
  }, [
    activeTab,
    sessionDirty,
    showOnboarding,
    showResetConfirmation,
    showSettings,
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

  const handleSkipOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "skipped");
    setShowOnboarding(false);
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "completed");
    setShowOnboarding(false);
  };

  const handleRerunSetup = () => {
    setShowSettings(false);
    setShowOnboarding(true);
  };

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col overflow-x-hidden bg-surface text-on-surface transition-colors duration-[var(--sf-duration-medium)]",
        recorder.tauriEnv && "pt-8",
      )}
    >
      <div className="pointer-events-none absolute left-[-8rem] top-24 size-80 rounded-full bg-primary-container/28 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-80 size-96 rounded-full bg-tertiary-container/20 blur-3xl" />
      <TitleBar />

      <AppHeader
        theme={resolvedTheme}
        toggleTheme={toggleTheme}
        tauriEnv={recorder.tauriEnv}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onHome={handleRequestHome}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-28 sm:px-6 md:pb-8 lg:px-8">
        <ErrorBanner message={error} />

        <section hidden={activeTab !== "transcribe"}>
          {settings.isApiKeyVerified ? (
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
              deepLKeyConfigured={settings.isDeepLKeyVerified}
              onResetTranslation={() => setTranslationInitialText("")}
              onTranslateResult={handleTranslateResult}
              onChatAboutThis={() => setActiveTab("chat")}
            />
          ) : (
            <ProviderGate
              title={copy.transcribe.connectTitle}
              description={copy.transcribe.connectBody}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}
        </section>

        <section hidden={activeTab !== "translate"}>
          {settings.isDeepLKeyVerified ? (
            <div
              ref={translationCardRef}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <TranslationCard
                key={"translation-" + sessionGeneration}
                apiKey={settings.deepLApiKey}
                plan={settings.deepLPlan}
                initialText={translationInitialText}
                defaultTargetLang={settings.deepLDefaultTargetLang}
                usage={settings.deepLUsage}
                onDirtyChange={setTranslationDirty}
              />
            </div>
          ) : (
            <ProviderGate
              title={copy.translate.connectTitle}
              description={copy.translate.connectBody}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}
        </section>

        <section hidden={activeTab !== "chat"}>
          {settings.isApiKeyVerified ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ChatSection
                key={"chat-" + sessionGeneration}
                apiKey={settings.apiKey}
                initialContext={transcription.transcription}
                onDirtyChange={setChatDirty}
              />
            </div>
          ) : (
            <ProviderGate
              title={copy.chat.connectTitle}
              description={copy.chat.connectBody}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}
        </section>
      </main>

      <footer className="hidden w-full py-6 text-center text-sm text-on-surface-variant/70 md:block">
        Version {pkg.version} · © 2026 JoeShep
      </footer>

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <SettingsPanel
        settings={settings}
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onRerunSetup={handleRerunSetup}
      />

      <OnboardingDialog
        open={showOnboarding}
        settings={settings}
        onComplete={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      <Dialog
        open={showResetConfirmation}
        onClose={() => setShowResetConfirmation(false)}
        title={copy.reset.title}
        description={copy.reset.body}
        closeLabel={copy.common.close}
        footer={
          <>
            <Button variant="text" onClick={() => setShowResetConfirmation(false)}>
              {copy.common.cancel}
            </Button>
            <Button variant="danger" onClick={handleConfirmedReset}>
              {copy.reset.confirm}
            </Button>
          </>
        }
      >
        <p className="text-sm text-on-surface-variant">{copy.reset.body}</p>
      </Dialog>
    </div>
  );
}
