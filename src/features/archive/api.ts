import { apiGet } from "@/shared/api/client";
import type { ArchivePage } from "./types";

export async function fetchArchivePage(beforeId?: number, limit = 30): Promise<ArchivePage> {
  const params = new URLSearchParams();
  if (beforeId !== undefined) params.set("before_id", String(beforeId));
  params.set("limit", String(limit));
  return apiGet<ArchivePage>(`/api/archive?${params.toString()}`);
}