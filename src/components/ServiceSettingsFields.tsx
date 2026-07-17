import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import type {
  SettingsDraft,
  SettingsValidationErrors,
} from "../hooks/useApiKeySettings";
import { DEEPL_TARGET_LANGUAGES } from "../constants/deepLLanguages";
import { IconButton, SelectField, TextField } from "./ui";
import { useLocale } from "../context/LocaleContext";

interface ServiceSettingsFieldsProps {
  draft: SettingsDraft;
  onChange: (draft: SettingsDraft) => void;
  errors: SettingsValidationErrors;
  mistralVerified?: boolean;
  deepLVerified?: boolean;
}

export function ServiceSettingsFields({
  draft,
  onChange,
  errors,
  mistralVerified,
  deepLVerified,
}: ServiceSettingsFieldsProps) {
  const { copy } = useLocale();
  const [showMistral, setShowMistral] = useState(false);
  const [showDeepL, setShowDeepL] = useState(false);

  return (
    <div className="space-y-8">
      <section className="space-y-4" aria-labelledby="mistral-settings-title">
        <div className="flex items-center justify-between gap-3">
          <h3 id="mistral-settings-title" className="text-base font-extrabold text-on-surface">
            {copy.settings.mistral}
          </h3>
          {mistralVerified && (
            <CheckCircle2 className="size-5 text-primary" aria-label="Verified" />
          )}
        </div>
        <TextField
          label={copy.settings.mistralKey}
          type={showMistral ? "text" : "password"}
          value={draft.apiKey}
          onChange={(event) => onChange({ ...draft, apiKey: event.target.value })}
          error={errors.mistral}
          helperText={copy.settings.localOnly}
          autoComplete="off"
          trailing={
            <IconButton
              size="sm"
              aria-label={showMistral ? "Hide key" : "Show key"}
              onClick={() => setShowMistral((visible) => !visible)}
            >
              {showMistral ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </IconButton>
          }
        />
      </section>

      <div className="border-t border-outline-variant" />

      <section className="space-y-4" aria-labelledby="deepl-settings-title">
        <div className="flex items-center justify-between gap-3">
          <h3 id="deepl-settings-title" className="text-base font-extrabold text-on-surface">
            {copy.settings.deepL}
          </h3>
          {deepLVerified && (
            <CheckCircle2 className="size-5 text-primary" aria-label="Verified" />
          )}
        </div>
        <TextField
          label={copy.settings.deepLKey}
          type={showDeepL ? "text" : "password"}
          value={draft.deepLApiKey}
          onChange={(event) => onChange({ ...draft, deepLApiKey: event.target.value })}
          error={errors.deepL}
          helperText={copy.settings.localOnly}
          autoComplete="off"
          trailing={
            <IconButton
              size="sm"
              aria-label={showDeepL ? "Hide key" : "Show key"}
              onClick={() => setShowDeepL((visible) => !visible)}
            >
              {showDeepL ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </IconButton>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label={copy.settings.deepLPlan}
            value={draft.deepLPlan}
            onChange={(event) =>
              onChange({ ...draft, deepLPlan: event.target.value === "pro" ? "pro" : "free" })
            }
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
          </SelectField>
          <SelectField
            label={copy.settings.targetLanguage}
            value={draft.deepLDefaultTargetLang}
            onChange={(event) =>
              onChange({ ...draft, deepLDefaultTargetLang: event.target.value })
            }
          >
            {DEEPL_TARGET_LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.name}
              </option>
            ))}
          </SelectField>
        </div>
      </section>
    </div>
  );
}
