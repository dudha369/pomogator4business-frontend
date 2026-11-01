import { createContext, useContext } from 'react';
import { createTranslator, type TranslateFn } from '@/i18n/translate';
import { DEFAULT_LOCALE, type LocaleCode } from '@/i18n/types';

export interface LanguageContextValue {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  t: TranslateFn;
}

export const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: createTranslator(DEFAULT_LOCALE),
});

export const useLanguage = () => useContext(LanguageContext);
