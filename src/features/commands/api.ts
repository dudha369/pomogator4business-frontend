import { apiGet } from "@/shared/api/client";
import type { Command, ModuleState } from "./types";

export async function fetchCommands(locale: string): Promise<Command[]> {
  const res = await apiGet<{ commands: Command[] }>(`/api/commands?locale=${locale}`);
  return [...res.commands].sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchModuleStates(): Promise<ModuleState[]> {
  const res = await apiGet<{ prefix: string; modules: ModuleState[] }>("/api/settings");
  return res.modules;
}