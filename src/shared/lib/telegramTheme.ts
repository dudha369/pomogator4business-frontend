import { retrieveLaunchParams, themeParams } from '@tma.js/sdk-react';
import type { RawThemeParams } from './getValidTheme';

export function readThemeParams(): RawThemeParams | undefined {
  try {
    const state = themeParams.state() as RawThemeParams | undefined;
    if (state?.bg_color) return state;
  } catch {}
  try {
    const params = retrieveLaunchParams().tgWebAppThemeParams as
      RawThemeParams | undefined;
    if (params?.bg_color) return params;
  } catch {}
  return undefined;
}

export function readSystemDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  );
}
