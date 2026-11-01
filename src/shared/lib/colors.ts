import type { HexColor } from '../types/Theme';

interface Hsl {
  h: number;
  s: number;
  l: number;
  yiq: number;
}

export function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#?[0-9a-fA-F]{6}$/.test(value);
}

export function normalizeHex(value: unknown, fallback: HexColor): HexColor {
  if (!isHexColor(value)) return fallback;
  return (
    value.startsWith('#') ? value : `#${value}`
  ).toLowerCase() as HexColor;
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace(/^#/, '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function toHsl(hex: string): Hsl {
  const { r: r8, g: g8, b: b8 } = parseHex(hex);
  const yiq = (r8 * 299 + g8 * 587 + b8 * 114) / 1000;

  const r = r8 / 255;
  const g = g8 / 255;
  const b = b8 / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100, yiq };
}

function fromHsl(h: number, s: number, l: number): HexColor {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) =>
    lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toByte = (v: number) =>
    Math.round(v * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toByte(f(0))}${toByte(f(8))}${toByte(f(4))}`;
}

export function isDarkColor(hex: string): boolean {
  const { r, g, b } = parseHex(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export function makeContrast(bgHex: string, shift = 20): HexColor {
  const { h, s, l, yiq } = toHsl(bgHex);
  const nextL = yiq >= 128 ? Math.max(0, l - shift) : Math.min(100, l + shift);
  return fromHsl(h, s, nextL);
}

export function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(Math.min(1, Math.max(0, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  const normalized = hex.startsWith('#') ? hex : `#${hex}`;
  return `${normalized.slice(0, 7)}${alpha}`;
}
