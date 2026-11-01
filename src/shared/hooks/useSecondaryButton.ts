import { useEffect, useRef } from 'react';
import { secondaryButton } from '@tma.js/sdk-react';
import { useTelegram } from './useTelegram';
import type { SecondaryButtonOptions } from '../types/SecondaryButtonOptions';
import { useTheme } from '../context/ThemeContext';

export function useSecondaryButton({
  text = '',
  iconCustomEmojiId = '',
  bgColor,
  textColor,
  isEnabled,
  isVisible = true,
  onClick,
  position = 'left',
}: SecondaryButtonOptions) {
  const { ready } = useTelegram();
  const onClickRef = useRef(onClick);
  const theme = useTheme();

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!ready || !secondaryButton.isMounted()) return;

    const unsubscribe = secondaryButton.onClick(() => {
      onClickRef.current?.();
    });

    return () => unsubscribe();
  }, [ready]);

  useEffect(() => {
    if (!ready || !secondaryButton.isMounted()) return;

    secondaryButton.setParams({
      bgColor: bgColor ?? theme.secondary_bg_color,
      textColor: textColor ?? theme.text_color,
      iconCustomEmojiId: undefined,
      position,
    });

    const timer = setTimeout(() => {
      secondaryButton.setParams({
        text,
        iconCustomEmojiId,
        isEnabled,
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
    position,
    theme.secondary_bg_color,
    theme.text_color,
  ]);

  useEffect(() => {
    if (!ready || !secondaryButton.isMounted()) return;

    return () => {
      secondaryButton.setParams({
        isVisible: false,
        text: '',
        iconCustomEmojiId: undefined,
      });
    };
  }, [ready]);
}
