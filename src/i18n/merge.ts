import type { LocaleCode } from "./types";
import { COMMON } from "./common";

type Dict = Record<string, string>;
type FeatureLocaleModule = { RU?: Dict; EN?: Dict; UK?: Dict };

const featureModules = import.meta.glob<FeatureLocaleModule>(
  "../features/**/locales/*.ts",
  { eager: true }
);

function buildTranslations(): Record<LocaleCode, Dict> {
  const result: Record<LocaleCode, Dict> = {
    ru: { ...COMMON.ru },
    en: { ...COMMON.en },
    uk: { ...COMMON.uk },
  };
  for (const mod of Object.values(featureModules)) {
    Object.assign(result.ru, mod.RU ?? {});
    Object.assign(result.en, mod.EN ?? {});
    Object.assign(result.uk, mod.UK ?? {});
  }
  return result;
}

export const TRANSLATIONS = buildTranslations();
