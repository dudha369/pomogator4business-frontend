import { apiGet } from "@/shared/api/client";
import type { ArchiveFilters, ArchivePage } from "./types";

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
  return apiGet<ArchivePage>(`/api/archive?${params.toString()}`);
}
