export interface DeepLLanguageOption {
  code: string;
  name: string;
}

export const DEEPL_SOURCE_LANGUAGES: DeepLLanguageOption[] = [
  { code: "", name: "Auto-detect" },
  { code: "AR", name: "Arabic" },
  { code: "BG", name: "Bulgarian" },
  { code: "CS", name: "Czech" },
  { code: "DA", name: "Danish" },
  { code: "DE", name: "German" },
  { code: "EL", name: "Greek" },
  { code: "EN", name: "English" },
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
  { code: "PT", name: "Portuguese" },
  { code: "RO", name: "Romanian" },
  { code: "RU", name: "Russian" },
  { code: "SK", name: "Slovak" },
  { code: "SL", name: "Slovenian" },
  { code: "SV", name: "Swedish" },
  { code: "TR", name: "Turkish" },
  { code: "UK", name: "Ukrainian" },
  { code: "ZH", name: "Chinese" },
];

export const DEEPL_TARGET_LANGUAGES: DeepLLanguageOption[] = [
  ...DEEPL_SOURCE_LANGUAGES.filter(({ code }) => code && code !== "EN" && code !== "PT" && code !== "ZH"),
  { code: "EN-GB", name: "English (British)" },
  { code: "EN-US", name: "English (American)" },
  { code: "PT-BR", name: "Portuguese (Brazilian)" },
  { code: "PT-PT", name: "Portuguese (European)" },
  { code: "ZH-HANS", name: "Chinese (Simplified)" },
  { code: "ZH-HANT", name: "Chinese (Traditional)" },
].sort((first, second) => first.name.localeCompare(second.name));
