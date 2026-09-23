export interface Command {
  module: string;
  name: string;
  aliases: string[];
  description: string;
  owner_only: boolean;
}

export interface CommandsResponse {
  commands: Command[];
}

export interface ModuleState {
  name: string;
  enabled: boolean;
}

export interface SettingsResponse {
  prefix: string;
  modules: ModuleState[];
}

export interface AccountConnection {
  owner_name: string | null;
  owner_username: string | null;
  prefix: string;
  rights: Record<string, boolean | null>;
}

export interface AccountMirror {
  connected: boolean;
  username: string | null;
}

export interface AccountEmojiStatus {
  granted: boolean;
  enabled: boolean;
}

export interface AccountResponse {
  connection: AccountConnection | null;
  mirror: AccountMirror;
  emoji_status: AccountEmojiStatus;
}
