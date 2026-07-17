import { expect, mock, test } from "bun:test";
import { act, renderHook } from "@testing-library/react";
import { useApiKeySettings, type SettingsDraft } from "./useApiKeySettings";

const draft: SettingsDraft = {
  apiKey: "mistral-new",
  deepLApiKey: "deepl-new",
  deepLPlan: "free",
  deepLDefaultTargetLang: "IT",
};

test("persists no edited credentials when either provider fails validation", async () => {
  localStorage.setItem("mistral_api_key", "mistral-old");
  const validateMistral = mock(async () => {});
  const validateDeepL = mock(async () => {
    throw new Error("DeepL rejected the key");
  });
  const { result } = renderHook(() =>
    useApiKeySettings({ validateMistral, validateDeepL }),
  );

  let saved = true;
  await act(async () => {
    saved = await result.current.saveAllSettings(draft);
  });

  expect(saved).toBe(false);
  expect(localStorage.getItem("mistral_api_key")).toBe("mistral-old");
  expect(localStorage.getItem("deepl_api_key")).toBeNull();
  expect(result.current.validationErrors.deepL).toBe("DeepL rejected the key");
});

test("commits all settings after every configured provider validates", async () => {
  const { result } = renderHook(() =>
    useApiKeySettings({
      validateMistral: async () => {},
      validateDeepL: async () => ({ character_count: 10, character_limit: 100 }),
    }),
  );

  let saved = false;
  await act(async () => {
    saved = await result.current.saveAllSettings(draft);
  });

  expect(saved).toBe(true);
  expect(localStorage.getItem("mistral_api_key")).toBe("mistral-new");
  expect(localStorage.getItem("deepl_api_key")).toBe("deepl-new");
  expect(localStorage.getItem("deepl_default_target_lang")).toBe("IT");
  expect(result.current.isApiKeyVerified).toBe(true);
  expect(result.current.isDeepLKeyVerified).toBe(true);
});
