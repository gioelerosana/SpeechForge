import { AudioLines, Languages, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocale } from "../context/LocaleContext";
import type { ApiKeySettings, SettingsDraft } from "../hooks/useApiKeySettings";
import { ServiceSettingsFields } from "./ServiceSettingsFields";
import { Button, Dialog } from "./ui";

interface OnboardingDialogProps {
  open: boolean;
  settings: ApiKeySettings;
  onComplete: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function OnboardingDialog({
  open,
  settings,
  onComplete,
  onSkip,
  onClose,
}: OnboardingDialogProps) {
  const { copy } = useLocale();
  const { clearValidationErrors, createDraft, saveAllSettings } = settings;
  const [stage, setStage] = useState<"welcome" | "services">("welcome");
  const [draft, setDraft] = useState<SettingsDraft>(createDraft);

  useEffect(() => {
    if (open) {
      setStage("welcome");
      setDraft(createDraft());
      clearValidationErrors();
    }
  }, [clearValidationErrors, createDraft, open]);

  const handleSave = async () => {
    if (await saveAllSettings(draft)) onComplete();
  };

  const handleSkip = () => {
    setStage("welcome");
    onSkip();
  };

  if (stage === "welcome") {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        title={copy.onboarding.welcomeTitle}
        description={copy.onboarding.welcomeBody}
        closeLabel={copy.common.close}
        footer={
          <>
            <Button variant="text" onClick={handleSkip}>{copy.common.skip}</Button>
            <Button onClick={() => setStage("services")}>{copy.common.continue}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [AudioLines, copy.nav.transcribe],
            [Languages, copy.nav.translate],
            [MessageSquare, copy.nav.chat],
          ].map(([Icon, label]) => {
            const FeatureIcon = Icon as typeof AudioLines;
            return (
              <div key={String(label)} className="rounded-[var(--sf-shape-lg)] bg-surface-container p-5 text-center">
                <FeatureIcon className="mx-auto size-7 text-primary" />
                <p className="mt-3 text-sm font-bold text-on-surface">{String(label)}</p>
              </div>
            );
          })}
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={copy.onboarding.setupTitle}
      description={copy.onboarding.setupBody}
      closeLabel={copy.common.close}
      dismissible={!settings.isSaving}
      footer={
        <>
          <Button variant="text" onClick={handleSkip} disabled={settings.isSaving}>
            {copy.common.skip}
          </Button>
          <Button
            onClick={() => void handleSave()}
            loading={settings.isSaving}
            disabled={!draft.apiKey.trim() && !draft.deepLApiKey.trim()}
          >
            {copy.onboarding.finish}
          </Button>
        </>
      }
    >
      <ServiceSettingsFields
        draft={draft}
        onChange={setDraft}
        errors={settings.validationErrors}
      />
    </Dialog>
  );
}
