import React, { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  Languages,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  X,
  ChevronDown,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const {
    apiKey,
    isApiKeyVerified,
    isSavingApiKey,
    showMistralKey,
    setShowMistralKey,
    handleApiKeyChange,
    saveMistralSettings,

    deepLApiKey,
    deepLPlan,
    deepLDefaultTargetLang,
    isDeepLKeyVerified,
    isTestingDeepL,
    deepLUsage,
    deepLTestError,
    showDeepLKey,
    setShowDeepLKey,
    handleDeepLKeyChange,
    testDeepLConnection,
    setDeepLDefaultTargetLang,
    setDeepLPlan,
  } = useSettings();

  const [mistralError, setMistralError] = useState("");
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Esc key closes settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSaveMistral = async () => {
    setMistralError("");
    await saveMistralSettings((msg) => setMistralError(msg));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click-away overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="relative w-full max-w-2xl bg-surface-container border border-outline/30 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-6 md:p-8 max-h-[90vh] overflow-y-auto outline-none animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline/20 pb-4 mb-6">
          <h2 id="settings-title" className="text-xl font-black text-on-surface">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface-variant focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Mistral Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <AudioLines className="w-3.5 h-3.5 text-on-primary" />
              </span>
              Mistral API
            </h3>
            <div className="flex flex-col gap-1">
              <label htmlFor="mistral-key" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                API Key
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <div className="relative min-w-0">
                  <input
                    id="mistral-key"
                    type={showMistralKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    placeholder="Enter your Mistral API Key"
                    className="w-full p-3.5 pr-20 rounded-2xl border border-outline/40 bg-surface text-on-surface focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowMistralKey((v) => !v)}
                      className="p-1 text-on-surface-variant hover:text-on-surface focus-visible:ring-1 focus-visible:ring-primary/40 rounded-lg outline-none"
                      aria-label={showMistralKey ? "Hide key" : "Show key"}
                    >
                      {showMistralKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {isSavingApiKey ? (
                      <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" />
                    ) : (
                      isApiKeyVerified && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )
                    )}
                  </div>
                </div>
                <button
                  onClick={() => void handleSaveMistral()}
                  disabled={isSavingApiKey}
                  className="bg-primary text-on-primary px-6 py-3.5 rounded-2xl hover:opacity-95 active:scale-[0.98] font-bold disabled:cursor-not-allowed disabled:opacity-70 transition-all text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {isSavingApiKey ? "Checking..." : "Save"}
                </button>
              </div>
              {mistralError && (
                <p className="text-xs text-error mt-1">{mistralError}</p>
              )}
            </div>
            <p className="text-xs text-on-surface-variant">
              Key is stored locally on your device.
            </p>
          </div>

          <div className="border-t border-outline/10" />

          {/* DeepL Section */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-tertiary flex items-center justify-center">
                <Languages className="w-3.5 h-3.5 text-on-tertiary" />
              </span>
              DeepL Translation
            </h3>

            {/* Plan Selector */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Plan
              </span>
              <div className="flex rounded-2xl overflow-hidden border border-outline/40 w-fit bg-surface">
                {(["free", "pro"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setDeepLPlan(p)}
                    className={cn(
                      "px-6 py-2 text-xs font-bold transition-all capitalize outline-none focus-visible:bg-tertiary-container/20",
                      deepLPlan === p
                        ? "bg-tertiary text-on-tertiary"
                        : "text-on-surface-variant hover:bg-surface-container-high",
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <p className="text-xs text-on-surface-variant">
                Free plan uses <code className="font-mono bg-surface-container-low px-1 py-0.5 rounded">api-free.deepl.com</code>; Pro uses <code className="font-mono bg-surface-container-low px-1 py-0.5 rounded">api.deepl.com</code>.
              </p>
            </div>

            {/* DeepL API Key */}
            <div className="flex flex-col gap-1">
              <label htmlFor="deepl-key" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                API Key
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <div className="relative min-w-0">
                  <input
                    id="deepl-key"
                    type={showDeepLKey ? "text" : "password"}
                    value={deepLApiKey}
                    onChange={(e) => handleDeepLKeyChange(e.target.value)}
                    placeholder="Enter your DeepL API Key"
                    className="w-full p-3.5 pr-20 rounded-2xl border border-outline/40 bg-surface text-on-surface focus:ring-2 focus:ring-tertiary/50 outline-none text-sm"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowDeepLKey((v) => !v)}
                      className="p-1 text-on-surface-variant hover:text-on-surface focus-visible:ring-1 focus-visible:ring-tertiary/40 rounded-lg outline-none"
                      aria-label={showDeepLKey ? "Hide key" : "Show key"}
                    >
                      {showDeepLKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    {isTestingDeepL ? (
                      <Loader2 className="w-5 h-5 animate-spin text-on-surface-variant" />
                    ) : (
                      isDeepLKeyVerified && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )
                    )}
                  </div>
                </div>
                <button
                  onClick={() => void testDeepLConnection()}
                  disabled={isTestingDeepL}
                  className="bg-primary text-on-primary px-6 py-3.5 rounded-2xl hover:opacity-95 active:scale-[0.98] font-bold disabled:cursor-not-allowed disabled:opacity-70 transition-all text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  {isTestingDeepL ? "Checking..." : "Save"}
                </button>
              </div>
              {deepLTestError && (
                <p className="text-xs text-error mt-1">{deepLTestError}</p>
              )}
              {deepLUsage && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-semibold bg-emerald-500/10 dark:bg-emerald-500/5 px-3 py-1.5 rounded-xl border border-emerald-500/20 w-fit">
                  {deepLUsage.character_count.toLocaleString()} / {deepLUsage.character_limit.toLocaleString()} characters used this billing period.
                </p>
              )}
            </div>

            {/* Target Language Select */}
            <div className="flex flex-col gap-1.5 w-full sm:w-72">
              <label htmlFor="deepl-lang" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Default translation target language
              </label>
              <div className="relative group w-full">
                <select
                  id="deepl-lang"
                  value={deepLDefaultTargetLang}
                  onChange={(e) => setDeepLDefaultTargetLang(e.target.value)}
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
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none group-focus-within:rotate-180 transition-transform" />
              </div>
            </div>

            <p className="text-xs text-on-surface-variant">
              Key is stored locally on your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
