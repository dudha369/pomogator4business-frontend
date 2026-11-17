import { type TranslateKey, TRANSLATIONS } from '@/shared/i18n/dictionaries';
import type { LocaleCode } from '@/shared/i18n/types';

type TranslateVars = Record<string, string | number>;
export type TranslateFn = (key: TranslateKey, vars?: TranslateVars) => string;

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.split(`{${key}}`).join(String(value)),
    template,
  );
}

export function createTranslator(locale: LocaleCode): TranslateFn {
  const dict: Record<string, string> = TRANSLATIONS[locale] ?? TRANSLATIONS.ru;
  const fallback: Record<string, string> = TRANSLATIONS.ru;
  return (key, vars) => interpolate(dict[key] ?? fallback[key] ?? key, vars);
}
