import { useEffect, useRef } from 'react';
import { backButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';

export const useBackButton = (onBack: () => void, enabled: boolean) => {
  const { ready } = useTelegram();
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!ready || !backButton.onClick.isAvailable()) return;

    const offClick = backButton.onClick(() => onBackRef.current());
    return () => {
      offClick();
      if (backButton.isMounted() && backButton.hide.isAvailable()) {
        backButton.hide();
      }
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || !backButton.isMounted()) return;

    if (enabled) {
      if (backButton.show.isAvailable()) backButton.show();
    } else if (backButton.hide.isAvailable()) {
      backButton.hide();
    }
  }, [enabled, ready]);
};
