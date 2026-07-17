import { useState, type KeyboardEvent } from "react";
import {
  AudioLines,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  Languages,
  Loader2,
} from "lucide-react";
import type { ApiKeySettings } from "../hooks/useApiKeySettings";
import { cn } from "../utils/cn";

interface SettingsPanelProps {
  settings: ApiKeySettings;
  visible: boolean;
  onClose: () => void;
}

export function SettingsPanel({
  settings,
  visible,
  onClose,
}: SettingsPanelProps) {
  const [showMistralKey, setShowMistralKey] = useState(false);
  const [showDeepLKey, setShowDeepLKey] = useState(false);
  const {
    apiKey,
    isApiKeyVerified,
    isSavingApiKey,
    deepLApiKey,
    deepLPlan,
    deepLDefaultTargetLang,
    isDeepLKeyVerified,
    isTestingDeepL,
    deepLUsage,
    deepLTestError,
    saveSettings,
    handleApiKeyChange,
    handleDeepLKeyChange,
    testDeepLConnection,
    handleDeepLPlanChange,
    handleDeepLDefaultTargetLangChange,
  } = settings;

  const handleSettingsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      void saveSettings();
    }
  };

  if (!visible) return null;

  return (
            <div
              onKeyDown={handleSettingsKeyDown}
              className="mt-3 rounded-[30px] border border-[color:var(--md-sys-color-outline)]/30 bg-[var(--md-sys-color-surface-container)] p-6 animate-in slide-in-from-top-2 shadow-[0_8px_28px_rgba(22,27,45,0.10)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.25)]"
            >
              <div className="max-w-2xl mx-auto space-y-8">
                {/* ── Mistral section ── */}
                <div>
                  <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[var(--md-sys-color-primary)] flex items-center justify-center">
                      <AudioLines className="w-3.5 h-3.5 text-[var(--md-sys-color-on-primary)]" />
                    </span>
                    Mistral API
                  </h2>
                  <label className="block text-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
                    API Key
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="relative min-w-0">
                      <input
                        type={showMistralKey ? "text" : "password"}
                        value={apiKey}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        placeholder="Enter your Mistral API Key"
                        className="w-full p-3.5 pr-20 rounded-2xl border border-[color:var(--md-sys-color-outline)]/40 bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-primary)]/50 outline-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowMistralKey((v) => !v)}
                          className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                          aria-label={showMistralKey ? "Hide key" : "Show key"}
                        >
                          {showMistralKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        {isSavingApiKey && (
                          <Loader2 className="w-5 h-5 animate-spin text-[var(--md-sys-color-on-surface-variant)]" />
                        )}
                        {!isSavingApiKey && isApiKeyVerified && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => void saveSettings()}
                      disabled={isSavingApiKey}
                      className="shrink-0 min-w-[9.25rem] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-7 py-3 rounded-2xl hover:opacity-90 font-bold disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSavingApiKey ? "Checking..." : "Save"}
                    </button>
                  </div>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-2">
                    Key is stored locally on your device.
                  </p>
                </div>

                {/* ── Divider ── */}
                <div className="border-t border-[color:var(--md-sys-color-outline)]/20" />

                {/* ── DeepL section ── */}
                <div>
                  <h2 className="text-base font-bold text-[var(--md-sys-color-on-surface)] mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[var(--md-sys-color-tertiary)] flex items-center justify-center">
                      <Languages className="w-3.5 h-3.5 text-[var(--md-sys-color-on-tertiary)]" />
                    </span>
                    DeepL Translation
                  </h2>

                  {/* Plan toggle */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
                      Plan
                    </label>
                    <div className="flex rounded-2xl overflow-hidden border border-[color:var(--md-sys-color-outline)]/40 w-fit">
                      {(["free", "pro"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleDeepLPlanChange(p)}
                          className={cn(
                            "px-6 py-2.5 text-sm font-bold transition-colors capitalize",
                            deepLPlan === p
                              ? "bg-[var(--md-sys-color-tertiary)] text-[var(--md-sys-color-on-tertiary)]"
                              : "bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-high)]",
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      Free plan uses{" "}
                      <code className="font-mono">api-free.deepl.com</code>;
                      Pro uses <code className="font-mono">api.deepl.com</code>.
                    </p>
                  </div>

                  {/* API Key */}
                  <label className="block text-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
                    API Key
                  </label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="relative min-w-0">
                      <input
                        type={showDeepLKey ? "text" : "password"}
                        value={deepLApiKey}
                        onChange={(e) => handleDeepLKeyChange(e.target.value)}
                        placeholder="Enter your DeepL API Key"
                        className="w-full p-3.5 pr-20 rounded-2xl border border-[color:var(--md-sys-color-outline)]/40 bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] focus:ring-2 focus:ring-[var(--md-sys-color-tertiary)]/50 outline-none"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setShowDeepLKey((v) => !v)}
                          className="p-1 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                          aria-label={showDeepLKey ? "Hide key" : "Show key"}
                        >
                          {showDeepLKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        {isTestingDeepL && (
                          <Loader2 className="w-5 h-5 animate-spin text-[var(--md-sys-color-on-surface-variant)]" />
                        )}
                        {!isTestingDeepL && isDeepLKeyVerified && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => void testDeepLConnection()}
                      disabled={isTestingDeepL}
                      className="shrink-0 min-w-[9.25rem] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] px-7 py-3 rounded-2xl hover:opacity-90 font-bold disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isTestingDeepL ? "Checking..." : "Save"}
                    </button>
                  </div>
                  {deepLTestError && (
                    <p className="text-xs text-[var(--md-sys-color-error)] mt-2">
                      {deepLTestError}
                    </p>
                  )}
                  {deepLUsage && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold">
                      {deepLUsage.character_count.toLocaleString()} /{" "}
                      {deepLUsage.character_limit.toLocaleString()} characters
                      used this billing period.
                    </p>
                  )}

                  {/* Default target language */}
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-on-surface mb-2">
                      Default translation target language
                    </label>
                    <div className="relative group w-full sm:w-72">
                      <select
                        value={deepLDefaultTargetLang}
                        onChange={(e) =>
                          handleDeepLDefaultTargetLangChange(e.target.value)
                        }
                        className="w-full p-3 pr-10 rounded-2xl border border-outline/40 bg-surface text-on-surface focus:ring-2 focus:ring-primary/50 outline-none text-sm appearance-none cursor-pointer transition-all"
                      >
                        {[
                          { code: "AR", name: "Arabic" },
                          { code: "BG", name: "Bulgarian" },
                          { code: "CS", name: "Czech" },
                          { code: "DA", name: "Danish" },
                          { code: "DE", name: "German" },
                          { code: "EL", name: "Greek" },
                          { code: "EN-GB", name: "English (British)" },
                          { code: "EN-US", name: "English (American)" },
                          { code: "ES", name: "Spanish" },
                          { code: "ET", name: "Estonian" },
                          { code: "FI", name: "Finnish" },
                          { code: "FR", name: "French" },
                          { code: "HU", name: "Hungarian" },
                          { code: "ID", name: "Indonesian" },
                          { code: "IT", name: "Italian" },
                          { code: "JA", name: "Japanese" },
                          { code: "KO", name: "Korean" },
                          { code: "LT", name: "Lithuanian" },
                          { code: "LV", name: "Latvian" },
                          { code: "NB", name: "Norwegian (Bokmål)" },
                          { code: "NL", name: "Dutch" },
                          { code: "PL", name: "Polish" },
                          { code: "PT-BR", name: "Portuguese (Brazilian)" },
                          { code: "PT-PT", name: "Portuguese (European)" },
                          { code: "RO", name: "Romanian" },
                          { code: "RU", name: "Russian" },
                          { code: "SK", name: "Slovak" },
                          { code: "SL", name: "Slovenian" },
                          { code: "SV", name: "Swedish" },
                          { code: "TR", name: "Turkish" },
                          { code: "UK", name: "Ukrainian" },
                          { code: "ZH-HANS", name: "Chinese (Simplified)" },
                          { code: "ZH-HANT", name: "Chinese (Traditional)" },
                        ].map((l) => (
                          <option key={l.code} value={l.code} className="bg-surface text-on-surface">
                            {l.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none group-focus-within:rotate-180 transition-transform" />
                    </div>
                  </div>

                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-3">
                    Key is stored locally on your device.
                  </p>
                </div>
              </div>
            </div>
  );
}
