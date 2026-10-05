export interface AccountConnection {
  owner_name: string | null;
  owner_username: string | null;
  prefix: string;
  rights: Record<string, boolean | null>;
}

export interface AccountEmojiStatus {
  granted: boolean;
  enabled: boolean;
}

export interface AccountResponse {
  connection: AccountConnection | null;
  emoji_status: AccountEmojiStatus;
  timezone_offset_minutes: number;
}