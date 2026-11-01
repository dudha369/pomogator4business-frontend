import { useEffect, useRef } from 'react';
import { mainButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { MainButtonOptions } from '../types/MainButtonOptions';
import { useTheme } from '../context/ThemeContext';

export function useMainButton({
  text = '',
  iconCustomEmojiId = '',
  bgColor,
  textColor,
  isEnabled,
  isVisible = true,
  isLoading = false,
  onClick,
}: MainButtonOptions) {
  const { ready } = useTelegram();
  const onClickRef = useRef(onClick);
  const theme = useTheme();

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!ready || !mainButton.isMounted()) return;

    const unsubscribe = mainButton.onClick(() => {
      onClickRef.current?.();
    });

    return () => unsubscribe();
  }, [ready]);

  useEffect(() => {
    if (!ready || !mainButton.isMounted()) return;

    mainButton.setParams({
      bgColor: bgColor ?? theme.accent_color,
      textColor: textColor ?? theme.button_text_color,
      iconCustomEmojiId: undefined,
    });

    const timer = setTimeout(() => {
      mainButton.setParams({
        text,
        iconCustomEmojiId,
        isEnabled: isEnabled && !isLoading,
        isVisible,
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [
    ready,
    text,
    iconCustomEmojiId,
    bgColor,
    textColor,
    isEnabled,
    isVisible,
    isLoading,
    theme.accent_color,
    theme.button_text_color,
  ]);

  useEffect(() => {
    if (!ready || !mainButton.isMounted()) return;

    if (isLoading) {
      mainButton.showLoader();
    } else {
      mainButton.hideLoader();
    }
  }, [ready, isLoading]);

  useEffect(() => {
    if (!ready || !mainButton.isMounted()) return;

    return () => {
      mainButton.hideLoader();
      mainButton.setParams({
        isVisible: false,
        text: '',
        iconCustomEmojiId: undefined,
      });
    };
  }, [ready]);
}
