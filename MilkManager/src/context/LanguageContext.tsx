import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translations, Language, TranslationKeys } from "../i18n/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKeys) => string;
  isLanguageSelected: boolean;
  langLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => key as string,
  isLanguageSelected: false,
  langLoaded: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language,           setLang]               = useState<Language>("en");
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const [langLoaded,         setLangLoaded]         = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("app_language").then(saved => {
      if (saved === "en" || saved === "hi" || saved === "mr") {
        setLang(saved);
        setIsLanguageSelected(true);
      }
      setLangLoaded(true);
    });
  }, []);

  function setLanguage(lang: Language) {
    setLang(lang);
    setIsLanguageSelected(true);
    AsyncStorage.setItem("app_language", lang);
  }

  function t(key: TranslationKeys): string {
    return translations[language][key];
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLanguageSelected, langLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
