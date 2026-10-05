import { apiGet, apiPost } from "@/shared/api/client";
import type { MirrorStatus } from "./types";

export async function fetchPrefix(): Promise<string> {
  const res = await apiGet<{ prefix: string }>("/api/settings");
  return res.prefix;
}

export async function updatePrefix(prefix: string): Promise<string> {
  const res = await apiPost<{ prefix: string }>("/api/settings/prefix", { prefix });
  return res.prefix;
}

export async function fetchMirrorStatus(): Promise<MirrorStatus> {
  return apiGet<MirrorStatus>("/api/mirror");
}

export async function connectMirror(token: string): Promise<MirrorStatus> {
  const res = await apiPost<{ connected: boolean; username: string }>("/api/mirror/connect", {
    token,
  });
  return { connected: res.connected, username: res.username };
}

export async function disconnectMirror(): Promise<void> {
  await apiPost("/api/mirror/disconnect", {});
}