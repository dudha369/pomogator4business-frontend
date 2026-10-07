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
  recentArchiveEntries: ArchiveEntry[];
}
