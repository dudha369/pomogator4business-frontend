import { apiGet } from "@/shared/api/client";
import type { ArchiveFilters, ArchivePage } from "./types";

/** "YYYY-MM-DD" → unix-время начала/конца этого дня в часовом поясе устройства. */
function dayBoundary(value: string, endOfDay: boolean): number | null {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59)
    : new Date(year, month - 1, day, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

export async function fetchArchivePage(
  filters: ArchiveFilters,
  beforeId?: number,
  limit = 30
): Promise<ArchivePage> {
  const params = new URLSearchParams();
  if (beforeId !== undefined) params.set("before_id", String(beforeId));
  params.set("limit", String(limit));
  if (filters.event) params.set("event", filters.event);
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.chatId !== null) params.set("chat_id", String(filters.chatId));
  const from = filters.dateFrom ? dayBoundary(filters.dateFrom, false) : null;
  const to = filters.dateTo ? dayBoundary(filters.dateTo, true) : null;
  if (from !== null) params.set("date_from", String(from));
  if (to !== null) params.set("date_to", String(to));
  params.set("sort", filters.sort);
  return apiGet<ArchivePage>(`/api/archive?${params.toString()}`);
}
