import { useCallback, useEffect, useState } from "react";
import {
  DeepLClient,
  type DeepLPlan,
  type DeepLUsage,
} from "../services/deepl/deepLClient";
import { MistralClient } from "../services/mistral/MistralClient";

interface UseApiKeySettingsOptions {
  onError: (message: string) => void;
  onOpenSettings: () => void;
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

export function useApiKeySettings({
  onError,
  onOpenSettings,
}: UseApiKeySettingsOptions) {
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyVerified, setIsApiKeyVerified] = useState(false);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [deepLApiKey, setDeepLApiKey] = useState("");
  const [deepLPlan, setDeepLPlan] = useState<DeepLPlan>("free");
  const [deepLDefaultTargetLang, setDeepLDefaultTargetLang] =
    useState("EN-US");
  const [isDeepLKeyVerified, setIsDeepLKeyVerified] = useState(false);
  const [isTestingDeepL, setIsTestingDeepL] = useState(false);
  const [deepLUsage, setDeepLUsage] = useState<DeepLUsage | null>(null);
  const [deepLTestError, setDeepLTestError] = useState("");

  useEffect(() => {
    const storedMistralKey = localStorage.getItem("mistral_api_key");
    if (storedMistralKey) {
      setApiKey(storedMistralKey);
      setIsApiKeyVerified(
        localStorage.getItem("mistral_api_key_verified") === "true",
      );
    }

    const storedDeepLKey = localStorage.getItem("deepl_api_key");
    if (storedDeepLKey) {
      setDeepLApiKey(storedDeepLKey);
      setIsDeepLKeyVerified(
        localStorage.getItem("deepl_api_key_verified") === "true",
      );
    }

    setDeepLPlan(
      (localStorage.getItem("deepl_plan") as DeepLPlan | null) ?? "free",
    );
    setDeepLDefaultTargetLang(
      localStorage.getItem("deepl_default_target_lang") ?? "EN-US",
    );
  }, []);

  const saveSettings = useCallback(async () => {
    const trimmedApiKey = apiKey.trim();
    if (!trimmedApiKey) {
      onError("Please enter a Mistral API Key before saving.");
      return;
    }

    try {
      onError("");
      setIsSavingApiKey(true);
      const client = new MistralClient(trimmedApiKey);
      await client.validateApiKey();

      localStorage.setItem("mistral_api_key", trimmedApiKey);
      localStorage.setItem("mistral_api_key_verified", "true");
      setApiKey(trimmedApiKey);
      setIsApiKeyVerified(true);
    } catch (err: unknown) {
      console.error("[useApiKeySettings] API key validation failed:", err);
      localStorage.removeItem("mistral_api_key_verified");
      setIsApiKeyVerified(false);
      onError("Invalid API Key. Please check it and try again.");
      onOpenSettings();
    } finally {
      setIsSavingApiKey(false);
    }
  }, [apiKey, onError, onOpenSettings]);

  const handleApiKeyChange = useCallback(
    (value: string) => {
      setApiKey(sanitizeApiKey(value));
      if (isApiKeyVerified) {
        setIsApiKeyVerified(false);
        localStorage.removeItem("mistral_api_key_verified");
      }
    },
    [isApiKeyVerified],
  );

  const handleDeepLKeyChange = useCallback(
    (value: string) => {
      setDeepLApiKey(sanitizeApiKey(value));
      if (isDeepLKeyVerified) {
        setIsDeepLKeyVerified(false);
        localStorage.removeItem("deepl_api_key_verified");
      }
      setDeepLTestError("");
    },
    [isDeepLKeyVerified],
  );

  const testDeepLConnection = useCallback(async () => {
    const trimmedKey = deepLApiKey.trim();
    if (!trimmedKey) {
      setDeepLTestError("Please enter a DeepL API key.");
      return;
    }

    setDeepLTestError("");
    setIsTestingDeepL(true);
    setDeepLUsage(null);

    try {
      const client = new DeepLClient(trimmedKey, deepLPlan);
      const usage = await client.getUsage();
      setDeepLUsage(usage);
      setIsDeepLKeyVerified(true);
      localStorage.setItem("deepl_api_key", trimmedKey);
      localStorage.setItem("deepl_plan", deepLPlan);
      localStorage.setItem(
        "deepl_default_target_lang",
        deepLDefaultTargetLang,
      );
      localStorage.setItem("deepl_api_key_verified", "true");
      setDeepLApiKey(trimmedKey);
    } catch (err: unknown) {
      console.error("[useApiKeySettings] DeepL connection test failed:", err);
      localStorage.removeItem("deepl_api_key_verified");
      setIsDeepLKeyVerified(false);
      setDeepLTestError(
        err instanceof Error ? err.message : "Connection test failed.",
      );
    } finally {
      setIsTestingDeepL(false);
    }
  }, [deepLApiKey, deepLDefaultTargetLang, deepLPlan]);

  const handleDeepLPlanChange = useCallback((plan: DeepLPlan) => {
    setDeepLPlan(plan);
    setIsDeepLKeyVerified(false);
    setDeepLUsage(null);
    localStorage.removeItem("deepl_api_key_verified");
  }, []);

  const handleDeepLDefaultTargetLangChange = useCallback((language: string) => {
    setDeepLDefaultTargetLang(language);
    localStorage.setItem("deepl_default_target_lang", language);
  }, []);

  const invalidateMistralApiKey = useCallback(() => {
    setIsApiKeyVerified(false);
    localStorage.removeItem("mistral_api_key_verified");
  }, []);

  return {
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
    invalidateMistralApiKey,
  };
}

export type ApiKeySettings = ReturnType<typeof useApiKeySettings>;
