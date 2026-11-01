import { TRANSLATIONS } from './merge';
import type { LocaleCode } from './types';

export type TranslateVars = Record<string, string | number>;
export type TranslateFn = (key: string, vars?: TranslateVars) => string;

function interpolate(template: string, vars?: TranslateVars): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.split(`{${key}}`).join(String(value)),
    template,
  );
}

export function createTranslator(locale: LocaleCode): TranslateFn {
  const dict = TRANSLATIONS[locale] ?? TRANSLATIONS.ru;
  return (key, vars) =>
    interpolate(dict[key] ?? TRANSLATIONS.ru[key] ?? key, vars);
}
