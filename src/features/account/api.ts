import { apiGet, apiPost } from "@/shared/api/client";
import type { AccountResponse } from "./types";

export async function fetchAccount(): Promise<AccountResponse> {
  return apiGet<AccountResponse>("/api/account");
}

export async function updateTimezone(offsetMinutes: number): Promise<number> {
  const res = await apiPost<{ offset_minutes: number }>("/api/account/timezone", {
    offset_minutes: offsetMinutes,
  });
  return res.offset_minutes;
}

export async function toggleEmojiStatus(enabled: boolean): Promise<boolean> {
  const res = await apiPost<{ enabled: boolean }>("/api/settings/emoji-status", { enabled });
  return res.enabled;
}