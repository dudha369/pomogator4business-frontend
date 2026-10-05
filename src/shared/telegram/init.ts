import { init } from "@tma.js/sdk-react";

let initialized = false;

export function initTelegramSdk(): boolean {
  try {
    init();
    initialized = true;
    return true;
  } catch {
    initialized = false;
    return false;
  }
}

/** true, если приложение реально запущено внутри Telegram и SDK смог инициализироваться. */
export function isTelegramEnvironment(): boolean {
  return initialized;
}
