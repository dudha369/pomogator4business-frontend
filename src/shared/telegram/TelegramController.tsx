import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { retrieveLaunchParams, settingsButton, viewport } from "@tma.js/sdk-react";

import { isTelegramEnvironment } from "./init";

const MOBILE_PLATFORMS = new Set(["ios", "android"]);

/**
 * Не рендерит ничего — просто подключает нативные элементы управления
 * Telegram Mini App: кнопку настроек в шапке приложения (переход на /settings)
 * и полноэкранный режим, но только на мобильных платформах (на десктопе/вебе
 * fullscreen не имеет смысла и выглядит навязчиво).
 */
export function TelegramController() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTelegramEnvironment()) return;

    try {
      if (!settingsButton.isMounted()) {
        settingsButton.mount();
      }
      settingsButton.show();
    } catch {
      // SettingsButton недоступна в этой версии клиента Telegram — не критично
    }

    const offClick = settingsButton.onClick(() => {
      navigate("/settings");
    });

    return () => {
      offClick();
    };
  }, [navigate]);

  useEffect(() => {
    if (!isTelegramEnvironment()) return;

    try {
      const { tgWebAppPlatform } = retrieveLaunchParams();
      if (!MOBILE_PLATFORMS.has(tgWebAppPlatform)) return;

      if (!viewport.isMounted()) {
        viewport.mount();
      }
      if (viewport.requestFullscreen.isAvailable()) {
        viewport.requestFullscreen();
      }
    } catch {
      // fullscreen недоступен на этой платформе/версии — молча пропускаем
    }
  }, []);

  return null;
}