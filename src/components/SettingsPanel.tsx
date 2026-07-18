import { useEffect, useState, type KeyboardEvent } from "react";
import pkg from "../../package.json";
import { useLocale, type Locale } from "../context/LocaleContext";
import { useTheme, type PaletteSource, type ThemeMode } from "../context/ThemeContext";
import type {
  ApiKeySettings,
  SettingsDraft,
} from "../hooks/useApiKeySettings";
import { ServiceSettingsFields } from "./ServiceSettingsFields";
import { Button, Dialog, SegmentedControl } from "./ui";

interface SettingsPanelProps {
  settings: ApiKeySettings;
  open: boolean;
  onClose: () => void;
  onRerunSetup: () => void;
}

export function SettingsPanel({
  settings,
  open,
  onClose,
  onRerunSetup,
}: SettingsPanelProps) {
  const { copy, locale, setLocale } = useLocale();
  const { mode, setMode, paletteSource, setPaletteSource, systemAccentActive } =
    useTheme();
  const { clearValidationErrors, createDraft, saveAllSettings } = settings;
  const [draft, setDraft] = useState<SettingsDraft>(createDraft);

  useEffect(() => {
    if (open) {
      setDraft(createDraft());
      clearValidationErrors();
    }
  }, [clearValidationErrors, createDraft, open]);

  const handleSave = async () => {
    if (await saveAllSettings(draft)) onClose();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      void handleSave();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={copy.settings.title}
      description={copy.settings.description}
      closeLabel={copy.common.close}
      dismissible={!settings.isSaving}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={settings.isSaving}>
            {copy.common.cancel}
          </Button>
          <Button onClick={() => void handleSave()} loading={settings.isSaving}>
            {copy.common.save}
          </Button>
        </>
      }
    >
      <div onKeyDown={handleKeyDown} className="space-y-9">
        <section className="space-y-4">
          <h3 className="text-base font-extrabold text-on-surface">{copy.settings.general}</h3>
          <div className="space-y-3">
            <p className="text-sm font-bold text-on-surface">{copy.settings.language}</p>
            <SegmentedControl<Locale>
              value={locale}
              onChange={setLocale}
              ariaLabel={copy.settings.language}
              items={[
                { value: "en", label: copy.common.english },
                { value: "it", label: copy.common.italian },
              ]}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-bold text-on-surface">{copy.settings.appearance}</p>
            <SegmentedControl<ThemeMode>
              value={mode}
              onChange={setMode}
              ariaLabel={copy.settings.appearance}
              items={[
                { value: "system", label: copy.common.system },
                { value: "light", label: copy.common.light },
                { value: "dark", label: copy.common.dark },
              ]}
            />
          </div>
          <div className="space-y-3">
            <p className="text-sm font-bold text-on-surface">{copy.settings.palette}</p>
            <SegmentedControl<PaletteSource>
              value={paletteSource}
              onChange={setPaletteSource}
              ariaLabel={copy.settings.palette}
              items={[
                { value: "system", label: copy.settings.paletteSystem },
                { value: "brand", label: copy.settings.paletteBrand },
              ]}
            />
            {paletteSource === "system" && !systemAccentActive ? (
              <p className="text-xs text-on-surface-variant">
                {copy.settings.paletteSystemUnavailable}
              </p>
            ) : null}
          </div>
        </section>

        <div className="border-t border-outline-variant" />
        <section className="space-y-5">
          <h3 className="text-base font-extrabold text-on-surface">{copy.settings.services}</h3>
          <ServiceSettingsFields
            draft={draft}
            onChange={setDraft}
            errors={settings.validationErrors}
            mistralVerified={settings.isApiKeyVerified}
            deepLVerified={settings.isDeepLKeyVerified}
          />
        </section>

        <div className="border-t border-outline-variant" />
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-on-surface">{copy.settings.about}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">SpeechForge v{pkg.version}</p>
          </div>
          <Button variant="outlined" size="sm" onClick={onRerunSetup}>
            {copy.settings.rerunSetup}
          </Button>
        </section>
      </div>
    </Dialog>
  );
}
