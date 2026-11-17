import type { HexColor } from './Theme';

export interface MainButtonOptions {
  text: string;
  iconCustomEmojiId?: string;
  bgColor?: HexColor;
  textColor?: HexColor;
  isEnabled: boolean;
  isVisible?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}
