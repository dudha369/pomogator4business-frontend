import type { ArchiveEntry } from "@/features/archive/types";

export interface HomeSummary {
  connected: boolean;
  ownerName: string | null;
  ownerUsername: string | null;
  mirrorConnected: boolean;
  commandsTotal: number;
  modulesEnabled: number;
  modulesTotal: number;
  emojiStatusEnabled: boolean;
  emojiStatusGranted: boolean;
  stats: HomeStats | null;
  recentArchiveEntries: ArchiveEntry[];
}

export interface HomeStats {
  todayTotal: number;
  todayIncoming: number;
  weekTotal: number;
  weekIncoming: number;
}
