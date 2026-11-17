import type { HexColor } from './Theme';

export type SecondaryButtonPosition = 'left' | 'right' | 'top' | 'bottom';

export interface SecondaryButtonOptions {
  text: string;
  iconCustomEmojiId?: string;
  bgColor?: HexColor;
  textColor?: HexColor;
  isEnabled: boolean;
  isVisible?: boolean;
  onClick: () => void;
  position?: SecondaryButtonPosition;
}
