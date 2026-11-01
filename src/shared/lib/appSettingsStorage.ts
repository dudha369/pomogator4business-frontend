import { getStoredValue, setStoredValue } from '../telegram/storage';
import { isAccentId } from './accents';
import { isLocaleCode, type LocaleCode } from '@/i18n/types';
import type { AccentId, ThemeMode } from '../types/Theme';

const SETTINGS_KEY = 'app_settings';
const LEGACY_ACCENT_KEY = 'color_scheme';

export interface AppSettings {
  themeMode?: ThemeMode;
  accent?: AccentId;
  language?: LocaleCode;
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'telegram' || value === 'light' || value === 'dark';
}

function parseSettings(raw: string | null): AppSettings {
  if (!raw) return {};
  try {
    const data = JSON.parse(raw) as Record<string, unknown>;
    const settings: AppSettings = {};
    if (isThemeMode(data.themeMode)) settings.themeMode = data.themeMode;
    if (isAccentId(data.accent)) settings.accent = data.accent;
    if (isLocaleCode(data.language)) settings.language = data.language;
    return settings;
  } catch {
    return {};
  }
}

export function peekAppSettings(): AppSettings {
  try {
    return parseSettings(localStorage.getItem(SETTINGS_KEY));
  } catch {
    return {};
  }
}

let current: AppSettings | null = null;
let loading: Promise<AppSettings> | null = null;
let writeChain: Promise<void> = Promise.resolve();

async function readFromStorage(): Promise<AppSettings> {
  const settings = parseSettings(await getStoredValue(SETTINGS_KEY));
  if (!settings.accent) {
    const legacy = await getStoredValue(LEGACY_ACCENT_KEY);
    if (isAccentId(legacy)) settings.accent = legacy;
  }
  return settings;
}

export function loadAppSettings(): Promise<AppSettings> {
  if (current) return Promise.resolve(current);
  loading ??= readFromStorage().then((settings) => (current ??= settings));
  return loading;
}

export function saveAppSettings(patch: Partial<AppSettings>): Promise<void> {
  writeChain = writeChain
    .then(async () => {
      const base = await loadAppSettings();
      current = { ...base, ...patch };
      await setStoredValue(SETTINGS_KEY, JSON.stringify(current));
    })
    .catch(() => {});
  return writeChain;
}
