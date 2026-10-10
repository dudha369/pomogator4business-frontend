import { apiDelete, apiGet, apiPost } from "@/shared/api/client";
import type { Command, ModuleState, UserAlias } from "./types";

export async function fetchCommands(locale: string): Promise<Command[]> {
  const res = await apiGet<{ commands: Command[] }>(`/api/commands?locale=${locale}`);
  return [...res.commands].sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchModuleStates(): Promise<ModuleState[]> {
  const res = await apiGet<{ prefix: string; modules: ModuleState[] }>("/api/settings");
  return res.modules;
}

export async function fetchUserAliases(): Promise<UserAlias[]> {
  const res = await apiGet<{ aliases: UserAlias[] }>("/api/aliases");
  return res.aliases;
}

export async function createUserAlias(command: string, alias: string): Promise<UserAlias> {
  return apiPost<UserAlias>("/api/aliases", { command, alias });
}

export async function deleteUserAlias(alias: string): Promise<void> {
  await apiDelete(`/api/aliases/${encodeURIComponent(alias)}`);
}
