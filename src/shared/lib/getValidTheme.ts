import type { AccentId, HexColor, Theme, ThemeMode } from '../types/Theme';
import { isDarkColor, makeContrast, normalizeHex } from './colors';
import { resolveAccent } from './accents';

export type RawThemeParams = Partial<
  Record<Exclude<keyof Theme, 'accent_color'>, string>
>;

const LIGHT: Theme = {
  bg_color: '#f2f2f7',
  text_color: '#0f0f0f',
  hint_color: '#8e8e93',
  link_color: '#2f88ff',
  button_color: '#2f88ff',
  button_text_color: '#ffffff',
  secondary_bg_color: '#e9e9ee',
  header_bg_color: '#f2f2f7',
  section_bg_color: '#ffffff',
  section_header_text_color: '#8e8e93',
  subtitle_text_color: '#8e8e93',
  destructive_text_color: '#ff3b30',
  accent_text_color: '#2f88ff',
  section_separator_color: '#e0e0e6',
  accent_color: '#2f88ff',
};

const DARK: Theme = {
  bg_color: '#0e0e10',
  text_color: '#f2f2f2',
  hint_color: '#9a9a9e',
  link_color: '#5aa4ff',
  button_color: '#5aa4ff',
  button_text_color: '#ffffff',
  secondary_bg_color: '#18181a',
  header_bg_color: '#0e0e10',
  section_bg_color: '#1c1c1e',
  section_header_text_color: '#9a9a9e',
  subtitle_text_color: '#9a9a9e',
  destructive_text_color: '#ff5b5b',
  accent_text_color: '#5aa4ff',
  section_separator_color: '#2c2c2e',
  accent_color: '#5aa4ff',
};

type TelegramKey = keyof RawThemeParams;

const TELEGRAM_KEYS: readonly TelegramKey[] = [
  'bg_color',
  'text_color',
  'hint_color',
  'link_color',
  'button_color',
  'button_text_color',
  'secondary_bg_color',
  'header_bg_color',
  'section_bg_color',
  'section_header_text_color',
  'subtitle_text_color',
  'destructive_text_color',
  'accent_text_color',
  'section_separator_color',
];

function buildTelegramTheme(params: RawThemeParams, base: Theme): Theme {
  const next = { ...base };
  for (const key of TELEGRAM_KEYS) {
    next[key] = normalizeHex(params[key], base[key]);
  }
  return next;
}

export function normalizeTheme(theme: Theme): Theme {
  const { bg_color } = theme;
  let { section_bg_color, secondary_bg_color } = theme;

  const sectionSame = section_bg_color === bg_color;
  const secondarySame = secondary_bg_color === bg_color;

  if (sectionSame && secondarySame) {
    const contrast: HexColor = makeContrast(bg_color);
    return {
      ...theme,
      section_bg_color: contrast,
      secondary_bg_color: contrast,
    };
  }
  if (sectionSame) section_bg_color = secondary_bg_color;
  if (secondarySame) secondary_bg_color = section_bg_color;

  return { ...theme, section_bg_color, secondary_bg_color };
}

/**
 * @param params     themeParams от Telegram (или undefined вне Telegram)
 * @param mode       выбор пользователя
 * @param accent     цветовая схема приложения
 * @param systemDark prefers-color-scheme — используется, когда Telegram-темы нет
 */
export function getValidTheme(
  params: RawThemeParams | undefined,
  mode: ThemeMode,
  accent: AccentId,
  systemDark: boolean,
): Theme {
  let theme: Theme;

  if (mode === 'light') {
    theme = LIGHT;
  } else if (mode === 'dark') {
    theme = DARK;
  } else if (params?.bg_color) {
    const dark = isDarkColor(normalizeHex(params.bg_color, DARK.bg_color));
    theme = normalizeTheme(buildTelegramTheme(params, dark ? DARK : LIGHT));
  } else {
    theme = systemDark ? DARK : LIGHT;
  }

  return {
    ...theme,
    accent_color: resolveAccent(accent, isDarkColor(theme.bg_color)),
  };
}
