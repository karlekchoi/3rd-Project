import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Loader from '../components/shared/Loader';

type Language = 'ko' | 'en' | 'ja' | 'zh' | 'vi' | 'fr' | 'sv';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: { [key: string]: string | number } | { returnObjects: boolean }) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko');
  const [translations, setTranslations] = useState<any | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('hangul_garden_language') as Language;
    if (savedLang && ['ko', 'en', 'ja', 'zh', 'vi', 'fr', 'sv'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        // Fetch is relative to the root index.html
        const response = await fetch(`./locales/${language}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translation file for ${language}`);
        }
        const data = await response.json();
        setTranslations(data);
      } catch (error) {
        console.error("Failed to fetch translations:", error);
        // Fallback to empty object in case of error to prevent app crash
        setTranslations({});
      }
    };
    fetchTranslations();
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    localStorage.setItem('hangul_garden_language', lang);
    setTranslations(null); // Set to null to show loader while new language is loading
    setLanguage(lang);
  };

  const t = useCallback((key: string, options: { [key: string]: string | number } | { returnObjects: boolean } = {}) => {
    if (!translations) {
      return key; // Return key if translations are not loaded yet
    }
    
    let text = key.split('.').reduce((obj, i) => obj?.[i], translations);

    if (typeof text === 'undefined') {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    if (options && 'returnObjects' in options && options.returnObjects) {
        return text;
    }

    if (typeof text === 'string' && options) {
      let interpolatedText = text;
      for (const optKey in options) {
        if (Object.prototype.hasOwnProperty.call(options, optKey) && optKey !== 'returnObjects') {
           const value = (options as { [key: string]: string | number })[optKey];
           interpolatedText = interpolatedText.replace(new RegExp(`{{${optKey}}}`, 'g'), String(value));
        }
      }
      return interpolatedText;
    }

    return text;
  }, [translations]);

  if (!translations) {
     return (
      <div className="min-h-screen font-sans bg-rose-50 text-gray-800 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
