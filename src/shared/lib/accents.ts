import type { AccentId, HexColor } from '../types/Theme';

export interface AccentScheme {
  id: AccentId;
  light: HexColor;
  dark: HexColor;
}

export const ACCENT_SCHEMES: readonly AccentScheme[] = [
  { id: 'blue', light: '#2f88ff', dark: '#5aa4ff' },
  { id: 'purple', light: '#7b5cff', dark: '#9a85ff' },
  { id: 'green', light: '#2fb350', dark: '#34c759' },
  { id: 'orange', light: '#e08600', dark: '#ff9f0a' },
  { id: 'pink', light: '#e0245e', dark: '#ff2d78' },
];

export const DEFAULT_ACCENT: AccentId = 'blue';

export function isAccentId(value: unknown): value is AccentId {
  return ACCENT_SCHEMES.some((scheme) => scheme.id === value);
}

export function resolveAccent(id: AccentId, isDark: boolean): HexColor {
  const scheme =
    ACCENT_SCHEMES.find((s) => s.id === id) ??
    ACCENT_SCHEMES.find((s) => s.id === DEFAULT_ACCENT)!;
  return isDark ? scheme.dark : scheme.light;
}
