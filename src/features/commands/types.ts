export interface Command {
  module: string;
  name: string;
  aliases: string[];
  title: string;
  description: string;
  long_description: string;
  usage: string;
  owner_only: boolean;
  /** где работает: "chat" — бизнес-чаты, "bot" — личка с ботом, "both" — везде */
  scope: "chat" | "bot" | "both";
}

export interface UserAlias {
  alias: string;
  command: string;
}

export interface ModuleState {
  name: string;
  enabled: boolean;
}