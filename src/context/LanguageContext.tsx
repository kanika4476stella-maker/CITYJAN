"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, memo } from "react";

type LanguageCode = "en" | "hi" | "ta" | "bn" | "mr";

interface LanguageContextProps {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  translateText: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translationCache: Record<string, string> = {};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("cityjan_lang") as LanguageCode;
    if (saved && ["en", "hi", "ta", "bn", "mr"].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  const changeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem("cityjan_lang", lang);
  };

  const translateText = async (text: string): Promise<string> => {
    if (!text || language === "en") return text;
    
    const cacheKey = `${language}:${text}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: language }),
      });
      const data = await res.json();
      if (data.translatedText) {
        translationCache[cacheKey] = data.translatedText;
        return data.translatedText;
      }
    } catch (e) {
      console.error("Translation error", e);
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

// Translate Component hook
interface TProps {
  children: string;
}

export const T = memo(({ children }: TProps) => {
  const { language, translateText } = useLanguage();
  const [translated, setTranslated] = useState<string>(children);

  useEffect(() => {
    if (language === "en") {
      setTranslated(children);
      return;
    }

    let isMounted = true;
    translateText(children).then(res => {
      if (isMounted) setTranslated(res);
    });
    
    return () => { isMounted = false; };
  }, [children, language, translateText]);

  return <span className="transition-all duration-300">{translated}</span>;
});
T.displayName = "T";
