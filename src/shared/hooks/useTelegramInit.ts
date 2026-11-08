import { useEffect, useRef } from 'react';
import {
  backButton,
  init,
  initData,
  mainButton,
  retrieveLaunchParams,
  secondaryButton,
  settingsButton,
  swipeBehavior,
  themeParams,
  viewport,
} from '@tma.js/sdk-react';
import { isMobileDevice } from '../lib/device';

const INIT_TIMEOUT_MS = 4000;

const MOBILE_PLATFORMS = new Set(['ios', 'android', 'android_x']);

function safely(label: string, fn: () => void) {
  try {
    fn();
  } catch (error) {
    console.warn(`[telegram] ${label} failed`, error);
  }
}

function requestSafeAreaUpdate() {
  safely('requestSafeAreaUpdate', () => {
    const w = window as unknown as {
      TelegramWebviewProxy?: { postEvent(type: string, data: string): void };
    };
    w.TelegramWebviewProxy?.postEvent('web_app_request_safe_area', '{}');
    w.TelegramWebviewProxy?.postEvent(
      'web_app_request_content_safe_area',
      '{}',
    );
  });
}

function shouldRequestFullscreen(): boolean {
  try {
    return MOBILE_PLATFORMS.has(retrieveLaunchParams().tgWebAppPlatform);
  } catch {
    return isMobileDevice();
  }
}

function mountComponent(
  component: {
    mount: { isAvailable(): boolean };
    isMounted(): boolean;
  },
  mount: () => void,
) {
  if (component.mount.isAvailable() && !component.isMounted()) mount();
}

async function initTelegram(): Promise<void> {
  try {
    init();
  } catch (error) {
    console.warn('[telegram] init failed', error);
    return;
  }

  safely('initData.restore', () => initData.restore());
  safely('themeParams', () =>
    mountComponent(themeParams, () => themeParams.mount()),
  );

  safely('settingsButton', () =>
    mountComponent(settingsButton, () => settingsButton.mount()),
  );
  safely('mainButton', () =>
    mountComponent(mainButton, () => {
      mainButton.mount();
      mainButton.hide();
    }),
  );
  safely('secondaryButton', () =>
    mountComponent(secondaryButton, () => {
      secondaryButton.mount();
      secondaryButton.hide();
    }),
  );
  safely('backButton', () =>
    mountComponent(backButton, () => {
      backButton.mount();
      backButton.hide();
    }),
  );
  safely('swipeBehavior', () =>
    mountComponent(swipeBehavior, () => {
      swipeBehavior.mount();
      swipeBehavior.disableVertical();
    }),
  );

  if (viewport.mount.isAvailable() && !viewport.isMounted()) {
    try {
      await viewport.mount();
    } catch (error) {
      console.warn('[telegram] viewport.mount failed', error);
    }
  }
  safely('viewport.expand', () => {
    if (viewport.expand.isAvailable()) viewport.expand();
  });

  if (shouldRequestFullscreen() && viewport.requestFullscreen.isAvailable()) {
    try {
      await viewport.requestFullscreen();
    } catch {}
    requestSafeAreaUpdate();
  }
}

function withTimeout(promise: Promise<void>, ms: number): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms);
    promise.finally(() => {
      clearTimeout(timer);
      resolve();
    });
  });
}

let initPromise: Promise<void> | null = null;

export function useTelegramInit(onReady: () => void) {
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    let active = true;
    initPromise ??= withTimeout(initTelegram(), INIT_TIMEOUT_MS);
    void initPromise.then(() => {
      if (active) onReadyRef.current();
    });
    return () => {
      active = false;
    };
  }, []);
}
