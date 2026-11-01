import { createContext, useContext } from 'react';
import type { AccentId, Theme, ThemeMode } from '../types/Theme';
import { getValidTheme } from '../lib/getValidTheme';
import { DEFAULT_ACCENT } from '../lib/accents';
import { isDarkColor } from '../lib/colors';
import { readSystemDark, readThemeParams } from '../lib/telegramTheme';

export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  accent: AccentId;
  setAccent: (accent: AccentId) => Promise<void>;
}

const defaultTheme = getValidTheme(
  readThemeParams(),
  'telegram',
  DEFAULT_ACCENT,
  readSystemDark(),
);

const DEFAULT_VALUE: ThemeContextValue = {
  theme: defaultTheme,
  isDark: isDarkColor(defaultTheme.bg_color),
  mode: 'telegram',
  setMode: async () => {},
  accent: DEFAULT_ACCENT,
  setAccent: async () => {},
};

export const ThemeContext = createContext<ThemeContextValue>(DEFAULT_VALUE);

export const useTheme = (): Theme => useContext(ThemeContext).theme;

export const useThemeMode = () => {
  const { mode, setMode, accent, setAccent, isDark } = useContext(ThemeContext);
  return { mode, setMode, accent, setAccent, isDark };
};
