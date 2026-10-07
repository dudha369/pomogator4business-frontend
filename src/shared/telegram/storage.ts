import { cloudStorage } from "@tma.js/sdk-react";

import { isTelegramEnvironment } from "./init";

/**
 * Хранилище настроек, синхронизируемое между устройствами пользователя через
 * Telegram CloudStorage — в отличие от localStorage, которое живёт только на
 * одном конкретном браузере/устройстве. Используется для вещей вроде выбранной
 * цветовой схемы: ожидается, что при входе с другого телефона будет видна
 * та же тема, а не настройки по умолчанию.
 *
 * Фолбэк на localStorage — для предпросмотра вне Telegram (там cloudStorage
 * просто недоступен физически) и на случай, если конкретная версия клиента
 * его не поддерживает.
 */

function cloudAvailable(): boolean {
  try {
    return isTelegramEnvironment() && cloudStorage.isSupported();
  } catch {
    return false;
  }
}

export async function getStoredValue(key: string): Promise<string | null> {
  if (cloudAvailable()) {
    try {
      const value = await cloudStorage.getItem(key);
      if (value) return value;
    } catch {
      // падаем на localStorage ниже
    }
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setStoredValue(key: string, value: string): Promise<void> {
  if (cloudAvailable()) {
    try {
      await cloudStorage.setItem(key, value);
    } catch {
      // продолжаем — запишется хотя бы локально
    }
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}
