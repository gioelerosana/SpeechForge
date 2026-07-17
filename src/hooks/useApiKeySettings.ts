import { useCallback, useState } from "react";
import {
  DeepLClient,
  type DeepLPlan,
  type DeepLUsage,
} from "../services/deepl/deepLClient";
import { MistralClient } from "../services/mistral/MistralClient";

export interface SettingsDraft {
  apiKey: string;
  deepLApiKey: string;
  deepLPlan: DeepLPlan;
  deepLDefaultTargetLang: string;
}

export interface SettingsValidationErrors {
  mistral?: string;
  deepL?: string;
}

interface UseApiKeySettingsOptions {
  validateMistral?: (key: string) => Promise<void>;
  validateDeepL?: (key: string, plan: DeepLPlan) => Promise<DeepLUsage>;
}

const STORAGE = {
  mistralKey: "mistral_api_key",
  mistralVerified: "mistral_api_key_verified",
  deepLKey: "deepl_api_key",
  deepLVerified: "deepl_api_key_verified",
  deepLPlan: "deepl_plan",
  deepLTarget: "deepl_default_target_lang",
} as const;

function readPlan(): DeepLPlan {
  return localStorage.getItem(STORAGE.deepLPlan) === "pro" ? "pro" : "free";
}

function sanitizeApiKey(value: string): string {
  let text = value;
  if (value.includes("<")) {
    try {
      const doc = new DOMParser().parseFromString(value, "text/html");
      text = doc.body?.textContent ?? value;
    } catch {
      text = value.replace(/<[^>]*>/g, "");
    }
  }
  return text.replace(/[^A-Za-z0-9\-_:.]/g, "").trim();
}

function readInitialDraft(): SettingsDraft {
  return {
    apiKey: localStorage.getItem(STORAGE.mistralKey) ?? "",
    deepLApiKey: localStorage.getItem(STORAGE.deepLKey) ?? "",
    deepLPlan: readPlan(),
    deepLDefaultTargetLang:
      localStorage.getItem(STORAGE.deepLTarget) ?? "EN-US",
  };
}

export function useApiKeySettings(options: UseApiKeySettingsOptions = {}) {
  const initial = readInitialDraft();
  const [apiKey, setApiKey] = useState(initial.apiKey);
  const [deepLApiKey, setDeepLApiKey] = useState(initial.deepLApiKey);
  const [deepLPlan, setDeepLPlan] = useState<DeepLPlan>(initial.deepLPlan);
  const [deepLDefaultTargetLang, setDeepLDefaultTargetLang] = useState(
    initial.deepLDefaultTargetLang,
  );
  const [isApiKeyVerified, setIsApiKeyVerified] = useState(
    () => localStorage.getItem(STORAGE.mistralVerified) === "true",
  );
  const [isDeepLKeyVerified, setIsDeepLKeyVerified] = useState(
    () => localStorage.getItem(STORAGE.deepLVerified) === "true",
  );
  const [deepLUsage, setDeepLUsage] = useState<DeepLUsage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] =
    useState<SettingsValidationErrors>({});

  const createDraft = useCallback(
    (): SettingsDraft => ({
      apiKey,
      deepLApiKey,
      deepLPlan,
      deepLDefaultTargetLang,
    }),
    [apiKey, deepLApiKey, deepLDefaultTargetLang, deepLPlan],
  );

  const saveAllSettings = useCallback(
    async (draft: SettingsDraft): Promise<boolean> => {
      const next: SettingsDraft = {
        ...draft,
        apiKey: sanitizeApiKey(draft.apiKey),
        deepLApiKey: sanitizeApiKey(draft.deepLApiKey),
      };
      setIsSaving(true);
      setValidationErrors({});

      const validateMistral =
        options.validateMistral ??
        ((key: string) => new MistralClient(key).validateApiKey());
      const validateDeepL =
        options.validateDeepL ??
        ((key: string, plan: DeepLPlan) =>
          new DeepLClient(key, plan).getUsage());

      const [mistralResult, deepLResult] = await Promise.allSettled([
        next.apiKey
          ? Promise.resolve().then(() => validateMistral(next.apiKey))
          : Promise.resolve(),
        next.deepLApiKey
          ? Promise.resolve().then(() =>
              validateDeepL(next.deepLApiKey, next.deepLPlan),
            )
          : Promise.resolve(null),
      ]);

      const errors: SettingsValidationErrors = {};
      if (mistralResult.status === "rejected") {
        errors.mistral =
          mistralResult.reason instanceof Error
            ? mistralResult.reason.message
            : "Mistral validation failed.";
      }
      if (deepLResult.status === "rejected") {
        errors.deepL =
          deepLResult.reason instanceof Error
            ? deepLResult.reason.message
            : "DeepL validation failed.";
      }

      if (errors.mistral || errors.deepL) {
        setValidationErrors(errors);
        setIsSaving(false);
        return false;
      }

      if (next.apiKey) {
        localStorage.setItem(STORAGE.mistralKey, next.apiKey);
        localStorage.setItem(STORAGE.mistralVerified, "true");
      } else {
        localStorage.removeItem(STORAGE.mistralKey);
        localStorage.removeItem(STORAGE.mistralVerified);
      }

      if (next.deepLApiKey) {
        localStorage.setItem(STORAGE.deepLKey, next.deepLApiKey);
        localStorage.setItem(STORAGE.deepLVerified, "true");
      } else {
        localStorage.removeItem(STORAGE.deepLKey);
        localStorage.removeItem(STORAGE.deepLVerified);
      }
      localStorage.setItem(STORAGE.deepLPlan, next.deepLPlan);
      localStorage.setItem(
        STORAGE.deepLTarget,
        next.deepLDefaultTargetLang,
      );

      setApiKey(next.apiKey);
      setDeepLApiKey(next.deepLApiKey);
      setDeepLPlan(next.deepLPlan);
      setDeepLDefaultTargetLang(next.deepLDefaultTargetLang);
      setIsApiKeyVerified(Boolean(next.apiKey));
      setIsDeepLKeyVerified(Boolean(next.deepLApiKey));
      setDeepLUsage(
        deepLResult.status === "fulfilled" ? deepLResult.value : null,
      );
      setIsSaving(false);
      return true;
    },
    [options.validateDeepL, options.validateMistral],
  );

  const invalidateMistralApiKey = useCallback(() => {
    setIsApiKeyVerified(false);
    localStorage.removeItem(STORAGE.mistralVerified);
  }, []);

  const clearValidationErrors = useCallback(() => setValidationErrors({}), []);

  return {
    apiKey,
    isApiKeyVerified,
    deepLApiKey,
    deepLPlan,
    deepLDefaultTargetLang,
    isDeepLKeyVerified,
    deepLUsage,
    isSaving,
    validationErrors,
    createDraft,
    saveAllSettings,
    clearValidationErrors,
    invalidateMistralApiKey,
  };
}

export type ApiKeySettings = ReturnType<typeof useApiKeySettings>;
