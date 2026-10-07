import { useEffect, useState } from "react";

import { apiGet } from "@/shared/api/client";

export interface ChatInfo {
  full_name: string;
  username: string | null;
}

const cache = new Map<number, ChatInfo>();

export function useChatInfo(userId: number | null): ChatInfo | null {
  const [info, setInfo] = useState<ChatInfo | null>(
    userId !== null ? (cache.get(userId) ?? null) : null
  );

  useEffect(() => {
    if (userId === null) {
      setInfo(null);
      return;
    }
    const cached = cache.get(userId);
    if (cached) {
      setInfo(cached);
      return;
    }
    let cancelled = false;
    apiGet<ChatInfo>(`/api/chat-info/${userId}`)
    .then((data) => {
      if (cancelled) return;
      cache.set(userId, data);
      setInfo(data);
    })
    .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return info;
}
