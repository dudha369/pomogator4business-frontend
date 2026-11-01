export type HexColor = `#${string}`;

export interface Theme {
  bg_color: HexColor;
  text_color: HexColor;
  hint_color: HexColor;
  link_color: HexColor;
  button_color: HexColor;
  button_text_color: HexColor;
  secondary_bg_color: HexColor;
  header_bg_color: HexColor;
  section_bg_color: HexColor;
  section_header_text_color: HexColor;
  subtitle_text_color: HexColor;
  destructive_text_color: HexColor;
  accent_text_color: HexColor;
  section_separator_color: HexColor;
  accent_color: HexColor;
}

export type ThemeMode = 'telegram' | 'light' | 'dark';

export type AccentId = 'blue' | 'purple' | 'green' | 'orange' | 'pink';
