export interface AccountConnection {
  owner_name: string | null;
  owner_username: string | null;
  prefix: string;
  rights: Record<string, boolean | null>;
}

export interface ClockStyleInfo {
  id: string;
  titles: Record<string, string>;
  available: boolean;
}

export interface AccountEmojiStatus {
  granted: boolean;
  enabled: boolean;
  style: string;
  styles: ClockStyleInfo[];
}

export interface AccountResponse {
  connection: AccountConnection | null;
  emoji_status: AccountEmojiStatus;
  timezone_offset_minutes: number;
}
