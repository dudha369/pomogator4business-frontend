import { cloudStorage } from '@tma.js/sdk-react';

function cloudAvailable(): boolean {
  try {
    return cloudStorage.isSupported();
  } catch {
    return false;
  }
}

export async function getStoredValue(key: string): Promise<string | null> {
  if (cloudAvailable()) {
    try {
      const value = await cloudStorage.getItem(key);
      if (value) return value;
    } catch {}
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setStoredValue(
  key: string,
  value: string,
): Promise<void> {
  if (cloudAvailable()) {
    try {
      await cloudStorage.setItem(key, value);
    } catch {}
  }
  try {
    localStorage.setItem(key, value);
  } catch {}
}
