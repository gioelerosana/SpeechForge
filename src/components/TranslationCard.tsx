import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Copy, Languages } from "lucide-react";
import {
  DEEPL_SOURCE_LANGUAGES,
  DEEPL_TARGET_LANGUAGES,
} from "../constants/deepLLanguages";
import { useLocale } from "../context/LocaleContext";
import {
  DeepLClient,
  DeepLError,
  FORMALITY_SUPPORTED_LANGS,
  type DeepLFormality,
  type DeepLModelType,
  type DeepLPlan,
  type DeepLSplitSentences,
  type DeepLUsage,
} from "../services/deepl/deepLClient";
import { cn } from "../utils/cn";
import { Button, Card, IconButton, SelectField } from "./ui";

export { DEEPL_SOURCE_LANGUAGES, DEEPL_TARGET_LANGUAGES };

const FREE_TIER_LIMIT = 500_000;
const QUOTA_WARN_RATIO = 0.9;

interface TranslationCardProps {
  apiKey: string;
  plan: DeepLPlan;
  initialText?: string;
  defaultTargetLang?: string;
  usage?: DeepLUsage | null;
  onTranslateComplete?: (translation: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export function TranslationCard({
  apiKey,
  plan,
  initialText = "",
  defaultTargetLang = "EN-US",
  usage,
  onTranslateComplete,
  onDirtyChange,
}: TranslationCardProps) {
  const { copy } = useLocale();
  const [sourceText, setSourceText] = useState(initialText);
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState(defaultTargetLang);
  const [translatedText, setTranslatedText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formality, setFormality] = useState<DeepLFormality>("default");
  const [modelType, setModelType] = useState<DeepLModelType>("quality_optimized");
  const [preserveFormatting, setPreserveFormatting] = useState(false);
  const [splitSentences, setSplitSentences] = useState<DeepLSplitSentences>("1");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translationRunRef = useRef(0);

  useEffect(() => {
    if (!initialText) return;
    translationRunRef.current += 1;
    setSourceText(initialText);
    setTranslatedText("");
    setDetectedLang("");
    setError("");
    setIsTranslating(false);
  }, [initialText]);

  useEffect(() => {
    onDirtyChange?.(Boolean(sourceText.trim() || translatedText.trim()));
  }, [onDirtyChange, sourceText, translatedText]);

  useEffect(
    () => () => {
      translationRunRef.current += 1;
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    },
    [],
  );

  const formalitySupported = FORMALITY_SUPPORTED_LANGS.has(targetLang.split("-")[0] ?? "");
  const quotaWarning =
    usage && usage.character_count / usage.character_limit >= QUOTA_WARN_RATIO
      ? copy.translate.quotaWarning(usage.character_count, usage.character_limit)
      : null;
  const freeTierWarning =
    !usage && sourceText.length >= FREE_TIER_LIMIT * QUOTA_WARN_RATIO
      ? copy.translate.freeTierWarning
      : null;

  const translate = async () => {
    if (!apiKey) {
      setError(copy.translate.apiMissing);
      return;
    }
    if (!sourceText.trim()) {
      setError(copy.translate.textRequired);
      return;
    }

    const runId = ++translationRunRef.current;
    setError("");
    setIsTranslating(true);
    setTranslatedText("");
    setDetectedLang("");

    try {
      const [result] = await new DeepLClient(apiKey, plan).translateText(
        [sourceText],
        targetLang,
        {
          sourceLang: sourceLang || undefined,
          formality: formalitySupported ? formality : undefined,
          modelType,
          preserveFormatting,
          splitSentences,
        },
      );
      if (translationRunRef.current !== runId || !result) return;
      setTranslatedText(result.text);
      setDetectedLang(result.detectedSourceLanguage);
      onTranslateComplete?.(result.text);
    } catch (err: unknown) {
      if (translationRunRef.current !== runId) return;
      console.error("[TranslationCard] Translation failed:", err);
      setError(err instanceof DeepLError ? err.message : copy.translate.failed);
    } finally {
      if (translationRunRef.current === runId) setIsTranslating(false);
    }
  };

  const copyResult = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setIsCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 1500);
    } catch (err: unknown) {
      console.error("[TranslationCard] Clipboard copy failed:", err);
    }
  };

  return (
    <div id="translation-card" className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-tertiary">DeepL</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
          {copy.translate.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-on-surface-variant">{copy.translate.subtitle}</p>
      </header>

      <Card variant="elevated" className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-outline-variant bg-surface-container-high px-5 py-4 sm:px-7">
          <span className="flex size-10 items-center justify-center rounded-[var(--sf-shape-md)] bg-tertiary-container text-on-tertiary-container">
            <Languages className="size-5" aria-hidden="true" />
          </span>
          <h2 className="font-extrabold text-on-surface">{copy.translate.serviceLabel}</h2>
        </div>

        <div className="space-y-6 p-5 sm:p-7">
          {(quotaWarning || freeTierWarning) && (
            <div className="flex items-start gap-3 rounded-[var(--sf-shape-md)] bg-tertiary-container px-4 py-3 text-sm text-on-tertiary-container">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <span>{quotaWarning ?? freeTierWarning}</span>
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-[var(--sf-shape-md)] bg-error-container px-4 py-3 text-sm text-on-error-container">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={copy.translate.source}
              value={sourceLang}
              onChange={(event) => setSourceLang(event.target.value)}
              helperText={
                detectedLang && !sourceLang
                  ? `${copy.translate.detected}: ${detectedLang}`
                  : undefined
              }
            >
              {DEEPL_SOURCE_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.code ? language.name : copy.translate.autoDetect}
                </option>
              ))}
            </SelectField>
            <SelectField
              label={copy.translate.target}
              value={targetLang}
              onChange={(event) => setTargetLang(event.target.value)}
            >
              {DEEPL_TARGET_LANGUAGES.map((language) => (
                <option key={language.code} value={language.code}>{language.name}</option>
              ))}
            </SelectField>
          </div>

          <div className="grid overflow-hidden rounded-[var(--sf-shape-lg)] border border-outline-variant lg:grid-cols-2 lg:divide-x lg:divide-outline-variant">
            <label className="flex min-h-72 flex-col bg-surface p-5">
              <span className="text-sm font-extrabold text-on-surface">{copy.translate.source}</span>
              <textarea
                value={sourceText}
                onChange={(event) => setSourceText(event.target.value)}
                placeholder={copy.translate.inputPlaceholder}
                className="mt-3 min-h-48 flex-1 resize-none bg-transparent leading-7 text-on-surface outline-none placeholder:text-on-surface-variant/70"
              />
              <span className="text-right text-xs text-on-surface-variant">
                {copy.translate.characters(sourceText.length)}
              </span>
            </label>

            <div className="flex min-h-72 flex-col border-t border-outline-variant bg-surface-container-low p-5 lg:border-t-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-extrabold text-on-surface">{copy.translate.output}</span>
                {translatedText && (
                  <IconButton
                    size="sm"
                    aria-label={isCopied ? copy.common.copied : copy.translate.copyTranslation}
                    onClick={() => void copyResult()}
                  >
                    {isCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </IconButton>
                )}
              </div>
              <div aria-live="polite" className="mt-3 flex min-h-48 flex-1">
                {translatedText ? (
                  <textarea
                    readOnly
                    aria-label={copy.translate.output}
                    value={translatedText}
                    className="min-h-48 w-full resize-none bg-transparent leading-7 text-on-surface outline-none"
                  />
                ) : (
                  <div className="m-auto flex flex-col items-center px-4 text-center text-on-surface-variant">
                    <Languages className="size-8 opacity-60" aria-hidden="true" />
                    <p className="mt-3 text-sm">{copy.translate.inputPlaceholder}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced((current) => !current)}
            className="flex min-h-11 items-center gap-2 rounded-[var(--sf-shape-full)] px-3 text-sm font-bold text-on-surface-variant hover:bg-on-surface/8"
          >
            <ChevronDown className={cn("size-4 transition-transform", showAdvanced && "rotate-180")} />
            {copy.translate.advanced}
          </button>

          {showAdvanced && (
            <div className="grid gap-4 rounded-[var(--sf-shape-lg)] bg-surface-container-low p-5 sm:grid-cols-2">
              <SelectField
                label={copy.translate.formality}
                value={formality}
                disabled={!formalitySupported}
                helperText={!formalitySupported ? copy.translate.unavailableForLanguage : undefined}
                onChange={(event) => setFormality(event.target.value as DeepLFormality)}
              >
                <option value="default">{copy.translate.defaultOption}</option>
                <option value="more">{copy.translate.moreFormal}</option>
                <option value="less">{copy.translate.lessFormal}</option>
                <option value="prefer_more">{copy.translate.preferMoreFormal}</option>
                <option value="prefer_less">{copy.translate.preferLessFormal}</option>
              </SelectField>
              <SelectField
                label={copy.translate.model}
                value={modelType}
                onChange={(event) => setModelType(event.target.value as DeepLModelType)}
              >
                <option value="quality_optimized">{copy.translate.qualityOptimized}</option>
                <option value="prefer_quality_optimized">{copy.translate.preferQuality}</option>
                <option value="latency_optimized">{copy.translate.latencyOptimized}</option>
              </SelectField>
              <SelectField
                label={copy.translate.splitSentences}
                value={splitSentences}
                onChange={(event) => setSplitSentences(event.target.value as DeepLSplitSentences)}
              >
                <option value="0">{copy.translate.noSplitting}</option>
                <option value="1">{copy.translate.splitPunctuation}</option>
                <option value="nonewlines">{copy.translate.splitNoNewlines}</option>
              </SelectField>
              <label className="flex min-h-12 items-center gap-3 self-end rounded-[var(--sf-shape-md)] border border-outline-variant bg-surface px-4 py-3 text-sm font-bold text-on-surface">
                <input
                  type="checkbox"
                  checked={preserveFormatting}
                  onChange={(event) => setPreserveFormatting(event.target.checked)}
                  className="size-4 accent-primary"
                />
                {copy.translate.keepFormatting}
              </label>
            </div>
          )}

          <Button
            leadingIcon={Languages}
            loading={isTranslating}
            disabled={!sourceText.trim()}
            onClick={() => void translate()}
          >
            {isTranslating ? copy.translate.translating : copy.translate.action}
          </Button>
        </div>
      </Card>
    </div>
  );
}
