import { apiGet } from "@/shared/api/client";
import { fetchArchivePage } from "@/features/archive/api";
import { DEFAULT_ARCHIVE_FILTERS } from "@/features/archive/types";
import type { ArchiveEntry } from "@/features/archive/types";
import type { HomeStats, HomeSummary } from "./types";

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
interface StatsApiResponse {
  today: { total: number; incoming: number };
  week: { total: number; incoming: number };
}
interface CommandsApiResponse {
  commands: unknown[];
}

export async function fetchHomeSummary(): Promise<HomeSummary> {
  const [account, mirror, settings, commands, archive, stats] = await Promise.all([
    apiGet<AccountApiResponse>("/api/account"),
    apiGet<MirrorApiResponse>("/api/mirror"),
    apiGet<SettingsApiResponse>("/api/settings"),
    apiGet<CommandsApiResponse>("/api/commands"),
    fetchArchivePage(DEFAULT_ARCHIVE_FILTERS, undefined, 3).catch(() => ({
      entries: [] as ArchiveEntry[],
      has_more: false,
      next_before_id: null,
    })),
    // счётчики — необязательная часть: без них главная всё равно открывается
    apiGet<StatsApiResponse>("/api/stats")
      .then(
        (s): HomeStats => ({
          todayTotal: s.today.total,
          todayIncoming: s.today.incoming,
          weekTotal: s.week.total,
          weekIncoming: s.week.incoming,
        })
      )
      .catch(() => null),
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
    emojiStatusGranted: account.emoji_status.granted,
    stats,
    recentArchiveEntries: archive.entries,
  };
}
