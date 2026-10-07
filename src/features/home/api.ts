import { apiGet } from "@/shared/api/client";
import { fetchArchivePage } from "@/features/archive/api";
import type { ArchiveEntry } from "@/features/archive/types";
import type { HomeSummary } from "./types";

interface AccountApiResponse {
  connection: { owner_name: string | null; owner_username: string | null } | null;
  emoji_status: { granted: boolean; enabled: boolean };
}
interface MirrorApiResponse {
  connected: boolean;
  username: string | null;
}
interface SettingsApiResponse {
  prefix: string;
  modules: { name: string; enabled: boolean }[];
}
interface CommandsApiResponse {
  commands: unknown[];
}

export async function fetchHomeSummary(): Promise<HomeSummary> {
  const [account, mirror, settings, commands, archive] = await Promise.all([
    apiGet<AccountApiResponse>("/api/account"),
    apiGet<MirrorApiResponse>("/api/mirror"),
    apiGet<SettingsApiResponse>("/api/settings"),
    apiGet<CommandsApiResponse>("/api/commands"),
    fetchArchivePage({ event: null, search: "", chatId: null }, undefined, 3).catch(() => ({
      entries: [] as ArchiveEntry[],
      has_more: false,
      next_before_id: null,
    })),
  ]);

  return {
    connected: account.connection !== null,
    ownerName: account.connection?.owner_name ?? null,
    ownerUsername: account.connection?.owner_username ?? null,
    mirrorConnected: mirror.connected,
    commandsTotal: commands.commands.length,
    modulesEnabled: settings.modules.filter((m) => m.enabled).length,
    modulesTotal: settings.modules.length,
    emojiStatusEnabled: account.emoji_status.granted && account.emoji_status.enabled,
    recentArchiveEntries: archive.entries,
  };
}
