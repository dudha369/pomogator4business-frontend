import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { apiGet, apiPost } from "@/shared/api/client";
import { TRANSLATIONS } from "./merge";
import type { LocaleCode } from "./types";

interface LocaleContextValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return Object.entries(vars).reduce(
    (acc, [key, value]) => acc.split(`{${key}}`).join(String(value)),
    template
  );
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("ru");

  useEffect(() => {
    apiGet<{ locale: LocaleCode }>("/api/locale")
    .then((data) => setLocaleState(data.locale))
    .catch(() => {});
  }, []);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    apiPost("/api/locale", { locale: code }).catch(() => {});
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = TRANSLATIONS[locale] ?? TRANSLATIONS.ru;
      const template = dict[key] ?? TRANSLATIONS.ru[key] ?? key;
      return interpolate(template, vars);
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return ctx;
}
