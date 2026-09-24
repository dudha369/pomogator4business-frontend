import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { themeParams, useSignal } from "@tma.js/sdk-react";

import { isTelegramEnvironment } from "../telegram/init";

interface ThemeContextValue {
  /** true = тёмная тема (телеграм или системная, смотря что доступно) */
  isDark: boolean;
  /** акцентный цвет текущей темы (--tg-theme-link-color или системный фолбэк) */
  accent: string;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  accent: "#2f88ff",
});

export const useAppTheme = () => useContext(ThemeContext);

function prefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

/** Применяет тему к документу: и через data-атрибут (для CSS), и напрямую. */
function applyDomTheme(isDark: boolean) {
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
}

/**
 * Источник цвета темы:
 * - внутри Telegram: живые CSS-переменные --tg-theme-* от themeParams.bindCssVars()
 *   плюс themeParams.isDark()/linkColor() как реактивные сигналы;
 * - вне Telegram (обычный браузер): system prefers-color-scheme.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [boundInTelegram, setBoundInTelegram] = useState(false);

  // Сигналы tma.js безопасно читать всегда — если SDK не смонтирован,
  // они просто дают undefined, и мы уходим на системный фолбэк ниже.
  const tgIsDark = useSignal(themeParams.isDark);
  const tgLink = useSignal(themeParams.linkColor);

  useEffect(() => {
    if (!isTelegramEnvironment()) return;
    try {
      if (!themeParams.isCssVarsBound()) {
        themeParams.bindCssVars();
      }
      setBoundInTelegram(true);
    } catch {
      setBoundInTelegram(false);
    }
  }, []);

  const [systemDark, setSystemDark] = useState(prefersDark);
  useEffect(() => {
    if (boundInTelegram) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [boundInTelegram]);

  const isDark = boundInTelegram ? Boolean(tgIsDark) : systemDark;
  const accent = (boundInTelegram && tgLink) || "#2f88ff";

  useEffect(() => {
    applyDomTheme(isDark);
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, accent }}>
      {children}
    </ThemeContext.Provider>
  );
}