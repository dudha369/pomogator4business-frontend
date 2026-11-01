import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { themeParams, useSignal } from '@tma.js/sdk-react';
import { ThemeContext } from '@/shared/context/ThemeContext';
import { getValidTheme, type RawThemeParams } from '@/shared/lib/getValidTheme';
import { useTelegram } from '@/shared/hooks/useTelegram';
import { useSystemDark } from '@/shared/hooks/useSystemDark';
import { readThemeParams } from '@/shared/lib/telegramTheme';
import { isDarkColor } from '@/shared/lib/colors';
import { DEFAULT_ACCENT } from '@/shared/lib/accents';
import {
  loadAppSettings,
  peekAppSettings,
  saveAppSettings,
} from '@/shared/lib/appSettingsStorage';
import type { AccentId, Theme, ThemeMode } from '@/shared/types/Theme';

function applyThemeToDocument(theme: Theme, isDark: boolean): void {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme)) {
    root.style.setProperty(`--tg-${key.replace(/_/g, '-')}`, value);
  }
  root.dataset.theme = isDark ? 'dark' : 'light';
  root.style.colorScheme = isDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();

  const [mode, setModeState] = useState<ThemeMode>(
    () => peekAppSettings().themeMode ?? 'telegram',
  );
  const [accent, setAccentState] = useState<AccentId>(
    () => peekAppSettings().accent ?? DEFAULT_ACCENT,
  );

  const telegramState = useSignal(themeParams.state) as
    RawThemeParams | undefined;
  const systemDark = useSystemDark();

  const theme = useMemo(() => {
    const params = telegramState?.bg_color ? telegramState : readThemeParams();
    return getValidTheme(params, mode, accent, systemDark);
  }, [telegramState, mode, accent, systemDark]);

  const isDark = isDarkColor(theme.bg_color);

  useLayoutEffect(() => {
    applyThemeToDocument(theme, isDark);
  }, [theme, isDark]);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    loadAppSettings().then((settings) => {
      if (cancelled) return;
      if (settings.themeMode) setModeState(settings.themeMode);
      if (settings.accent) setAccentState(settings.accent);
    });
    return () => {
      cancelled = true;
    };
  }, [ready]);

  const setMode = useCallback(async (next: ThemeMode) => {
    setModeState(next);
    await saveAppSettings({ themeMode: next });
  }, []);

  const setAccent = useCallback(async (next: AccentId) => {
    setAccentState(next);
    await saveAppSettings({ accent: next });
  }, []);

  const value = useMemo(
    () => ({ theme, isDark, mode, setMode, accent, setAccent }),
    [theme, isDark, mode, setMode, accent, setAccent],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
