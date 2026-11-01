export const LOCALE_CODES = ['ru', 'en', 'uk'] as const;

export type LocaleCode = (typeof LOCALE_CODES)[number];

export const DEFAULT_LOCALE: LocaleCode = 'ru';

export const LANGUAGE_NAMES: Record<LocaleCode, string> = {
  ru: 'Русский',
  en: 'English',
  uk: 'Українська',
};

export function isLocaleCode(value: unknown): value is LocaleCode {
  return LOCALE_CODES.some((code) => code === value);
}

export function fromTelegramLocale(code: string | undefined): LocaleCode {
  const short = code?.split('-')[0]?.toLowerCase();
  return isLocaleCode(short) ? short : DEFAULT_LOCALE;
}
