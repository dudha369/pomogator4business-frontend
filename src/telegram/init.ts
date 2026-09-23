import { init } from "@tma.js/sdk-react";

export function initTelegramSdk(): boolean {
  try {
    init();
    return true;
  } catch {
    return false;
  }
}
