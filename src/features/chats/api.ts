import { apiGet, apiPost } from "@/shared/api/client";
import type { ChatItem, ReadAllRequest, ReadAllResult } from "./types";

export async function fetchChats(): Promise<ChatItem[]> {
  const res = await apiGet<{ chats: ChatItem[] }>("/api/chats");
  return res.chats;
}

export async function setFavorite(chatId: number, favorite: boolean): Promise<void> {
  await apiPost("/api/favorites", { chat_id: chatId, favorite });
}

export function readAll(request: ReadAllRequest): Promise<ReadAllResult> {
  return apiPost<ReadAllResult>("/api/readall", request);
}
