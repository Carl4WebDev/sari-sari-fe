import { useState, useCallback } from "react";
import { translations, type Language, type TranslationKey } from "./translations";

const STORAGE_KEY = "app_language";

function getStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "fil" || stored === "en") return stored;
  return "en";
}

export function useTranslation() {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dict = translations[language] as Record<string, string>;
      let value = dict[key] ?? translations.en[key as TranslationKey] ?? key;

      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, String(v));
        });
      }

      return value;
    },
    [language]
  );

  return { t, language, setLanguage };
}
