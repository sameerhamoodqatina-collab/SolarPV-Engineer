'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import en from './en';
import ar from './ar';

type NestedValue = string | number | boolean | NestedValue[] | { [key: string]: NestedValue };

type TranslationDict = { [key: string]: NestedValue };

const translations: Record<string, TranslationDict> = { en, ar };

interface I18nContextValue {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function getNestedValue(obj: NestedValue, path: string): string {
  const keys = path.split('.');
  let current: NestedValue = obj;

  for (const key of keys) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      return path;
    }
    const dict = current as { [key: string]: NestedValue };
    if (!(key in dict)) {
      return path;
    }
    current = dict[key];
  }

  return typeof current === 'string' ? current : String(current);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<'en' | 'ar'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('solar-pv-language') as 'en' | 'ar' | null;
      if (stored === 'en' || stored === 'ar') return stored;
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: 'en' | 'ar') => {
    setLanguageState(lang);
    localStorage.setItem('solar-pv-language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const dict = translations[language] ?? translations.en;
      let value = getNestedValue(dict as NestedValue, key);

      if (params) {
        for (const [param, replacement] of Object.entries(params)) {
          value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), String(replacement));
        }
      }

      return value;
    },
    [language],
  );

  const isRTL = useMemo(() => language === 'ar', [language]);

  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t, isRTL }),
    [language, setLanguage, t, isRTL],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useLanguage(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
