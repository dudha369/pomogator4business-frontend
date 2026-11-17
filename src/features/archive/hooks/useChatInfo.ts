import { useQuery } from '@tanstack/react-query';

import { ApiError, apiGet } from '@/shared/api/client';
import type { Schema } from '@/shared/api/schema';
import { queryKeys } from '@/shared/api/queryKeys';

export type ChatInfo = Schema<'ChatInfoOut'>;

/** 404 («собеседника нет») — тоже ответ: кэшируется как `null`, иначе каждая
 * карточка архива того же собеседника ходила бы на сервер заново. Одновременные
 * запросы react-query объединяет; сетевой сбой в кэш не попадает. */
async function loadChatInfo(userId: number): Promise<ChatInfo | null> {
  try {
    return await apiGet<ChatInfo>(`/api/chat-info/${userId}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function useChatInfo(userId: number | null): ChatInfo | null {
  const { data } = useQuery({
    queryKey: queryKeys.chatInfo(userId ?? 0),
    queryFn: () => loadChatInfo(userId!),
    enabled: userId !== null,
    staleTime: Infinity,
  });
  return data ?? null;
}
