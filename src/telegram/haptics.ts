import { hapticFeedback } from "@tma.js/sdk-react";

type Impact = "light" | "medium" | "heavy" | "rigid" | "soft";

/**
 * Тактильный отклик Telegram (на iOS это Taptic Engine). navigator.vibrate на
 * iPhone не работает вообще, поэтому для «ощущения стекла» нужен именно он.
 * Вне Telegram / на старых клиентах молча ничего не делает.
 */
export const haptic = {
  impact(style: Impact = "light") {
    try {
      if (hapticFeedback.isSupported()) hapticFeedback.impactOccurred(style);
      else navigator.vibrate?.(8);
    } catch {
      /* нет SDK / не поддерживается — ок */
    }
  },
  selection() {
    try {
      if (hapticFeedback.isSupported()) hapticFeedback.selectionChanged();
    } catch {
      /* ок */
    }
  },
};