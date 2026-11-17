import { useEffect, useState } from 'react';

import { ApiError, apiGet } from '@/shared/api/client';

export interface ChatInfo {
  full_name: string;
  username: string | null;
}

/** userId → запрос. Хранится и «собеседника нет» (null, ответ 404): иначе
 * каждая карточка архива того же собеседника ходила бы на сервер заново.
 * Одновременные запросы объединяются. Сетевой сбой не кэшируется. */
const requests = new Map<number, Promise<ChatInfo | null>>();

function loadChatInfo(userId: number): Promise<ChatInfo | null> {
  let request = requests.get(userId);
  if (!request) {
    request = apiGet<ChatInfo>(`/api/chat-info/${userId}`).catch(
      (error: unknown) => {
        if (!(error instanceof ApiError && error.status === 404)) {
          requests.delete(userId); // временный сбой — пусть повторится
        }
        return null;
      },
    );
    requests.set(userId, request);
  }
  return request;
}

export function useChatInfo(userId: number | null): ChatInfo | null {
  const [info, setInfo] = useState<ChatInfo | null>(null);

  useEffect(() => {
    if (userId === null) {
      setInfo(null);
      return;
    }
    let cancelled = false;
    loadChatInfo(userId).then((data) => {
      if (!cancelled) setInfo(data);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return info;
}
