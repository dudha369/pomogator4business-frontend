export interface Command {
  module: string;
  name: string;
  aliases: string[];
  title: string;
  description: string;
  long_description: string;
  usage: string;
  owner_only: boolean;
}

export interface UserAlias {
  alias: string;
  command: string;
}

export interface ModuleState {
  name: string;
  enabled: boolean;
}