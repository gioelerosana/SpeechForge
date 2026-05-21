import React, { createContext, useContext, useState, useEffect } from "react";
import { MistralClient } from "../services/mistral/MistralClient";
import {
  DeepLClient,
  type DeepLPlan,
  type DeepLUsage,
} from "../services/deepl/deepLClient";
import { sanitizeApiKey } from "../utils/sanitize";

interface SettingsContextType {
  // Mistral State
  apiKey: string;
  isApiKeyVerified: boolean;
  isSavingApiKey: boolean;
  showMistralKey: boolean;
  setShowMistralKey: React.Dispatch<React.SetStateAction<boolean>>;
  handleApiKeyChange: (val: string) => void;
  saveMistralSettings: (onError: (msg: string) => void) => Promise<boolean>;

  // DeepL State
  deepLApiKey: string;
  deepLPlan: DeepLPlan;
  deepLDefaultTargetLang: string;
  isDeepLKeyVerified: boolean;
  isTestingDeepL: boolean;
  deepLUsage: DeepLUsage | null;
  deepLTestError: string;
  showDeepLKey: boolean;
  setShowDeepLKey: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeepLKeyChange: (val: string) => void;
  saveDeepLSettings: () => void;
  testDeepLConnection: () => Promise<boolean>;
  setDeepLPlan: (p: DeepLPlan) => void;
  setDeepLDefaultTargetLang: (lang: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Mistral
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyVerified, setIsApiKeyVerified] = useState(false);
  const [isSavingApiKey, setIsSavingApiKey] = useState(false);
  const [showMistralKey, setShowMistralKey] = useState(false);

  // DeepL
  const [deepLApiKey, setDeepLApiKey] = useState("");
  const [deepLPlan, setDeepLPlan] = useState<DeepLPlan>("free");
  const [deepLDefaultTargetLang, setDeepLDefaultTargetLang] = useState("EN-US");
  const [isDeepLKeyVerified, setIsDeepLKeyVerified] = useState(false);
  const [isTestingDeepL, setIsTestingDeepL] = useState(false);
  const [deepLUsage, setDeepLUsage] = useState<DeepLUsage | null>(null);
  const [deepLTestError, setDeepLTestError] = useState("");
  const [showDeepLKey, setShowDeepLKey] = useState(false);

  // Bootstrap Settings
  useEffect(() => {
    const storedMistralKey = localStorage.getItem("mistral_api_key");
    const storedMistralVerified =
      localStorage.getItem("mistral_api_key_verified") === "true";
    if (storedMistralKey) {
      setApiKey(storedMistralKey);
      setIsApiKeyVerified(storedMistralVerified);
    }

    const storedDeepLKey = localStorage.getItem("deepl_api_key");
    const storedDeepLPlan =
      (localStorage.getItem("deepl_plan") as DeepLPlan) ?? "free";
    const storedDeepLTarget =
      localStorage.getItem("deepl_default_target_lang") ?? "EN-US";
    const storedDeepLVerified =
      localStorage.getItem("deepl_api_key_verified") === "true";
    if (storedDeepLKey) {
      setDeepLApiKey(storedDeepLKey);
      setIsDeepLKeyVerified(storedDeepLVerified);
    }
    setDeepLPlan(storedDeepLPlan);
    setDeepLDefaultTargetLang(storedDeepLTarget);
  }, []);

  // Mistral handlers
  const handleApiKeyChange = (value: string) => {
    const cleanKey = sanitizeApiKey(value);
    setApiKey(cleanKey);
    if (isApiKeyVerified) {
      setIsApiKeyVerified(false);
      localStorage.removeItem("mistral_api_key_verified");
    }
  };

  const saveMistralSettings = async (onError: (msg: string) => void): Promise<boolean> => {
    const trimmedApiKey = apiKey.trim();
    if (!trimmedApiKey) {
      onError("Please enter a Mistral API Key before saving.");
      return false;
    }

    try {
      setIsSavingApiKey(true);
      const client = new MistralClient(trimmedApiKey);
      await client.validateApiKey();

      localStorage.setItem("mistral_api_key", trimmedApiKey);
      localStorage.setItem("mistral_api_key_verified", "true");
      setApiKey(trimmedApiKey);
      setIsApiKeyVerified(true);
      return true;
    } catch (err: unknown) {
      console.error("[SettingsContext] Mistral API key validation failed:", err);
      localStorage.removeItem("mistral_api_key_verified");
      setIsApiKeyVerified(false);
      onError("Invalid API Key. Please check it and try again.");
      return false;
    } finally {
      setIsSavingApiKey(false);
    }
  };

  // DeepL handlers
  const handleDeepLKeyChange = (value: string) => {
    const cleanKey = sanitizeApiKey(value);
    setDeepLApiKey(cleanKey);
    if (isDeepLKeyVerified) {
      setIsDeepLKeyVerified(false);
      localStorage.removeItem("deepl_api_key_verified");
    }
    setDeepLTestError("");
  };

  const saveDeepLSettings = () => {
    const trimmed = deepLApiKey.trim();
    localStorage.setItem("deepl_api_key", trimmed);
    localStorage.setItem("deepl_plan", deepLPlan);
    localStorage.setItem("deepl_default_target_lang", deepLDefaultTargetLang);
  };

  const testDeepLConnection = async (): Promise<boolean> => {
    const trimmedKey = deepLApiKey.trim();
    if (!trimmedKey) {
      setDeepLTestError("Please enter a DeepL API key.");
      return false;
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
      localStorage.setItem("deepl_default_target_lang", deepLDefaultTargetLang);
      localStorage.setItem("deepl_api_key_verified", "true");
      setDeepLApiKey(trimmedKey);
      return true;
    } catch (err: unknown) {
      console.error("[SettingsContext] DeepL connection test failed:", err);
      localStorage.removeItem("deepl_api_key_verified");
      setIsDeepLKeyVerified(false);
      const msg = err instanceof Error ? err.message : "Connection test failed.";
      setDeepLTestError(msg);
      return false;
    } finally {
      setIsTestingDeepL(false);
    }
  };

  const updateDeepLPlan = (p: DeepLPlan) => {
    setDeepLPlan(p);
    setIsDeepLKeyVerified(false);
    setDeepLUsage(null);
    localStorage.removeItem("deepl_api_key_verified");
    localStorage.setItem("deepl_plan", p);
  };

  const updateDeepLTargetLang = (lang: string) => {
    setDeepLDefaultTargetLang(lang);
    localStorage.setItem("deepl_default_target_lang", lang);
  };

  return (
    <SettingsContext.Provider
      value={{
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
        saveDeepLSettings,
        testDeepLConnection,
        setDeepLPlan: updateDeepLPlan,
        setDeepLDefaultTargetLang: updateDeepLTargetLang,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
