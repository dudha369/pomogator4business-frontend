import { useQuery } from '@tanstack/react-query';

import { API_BASE_URL, initDataHeader } from '@/shared/api/client';
import { queryKeys } from '@/shared/api/queryKeys';

/** <img src> не умеет слать заголовки авторизации — грузим байты через fetch
 * и превращаем в object URL. Кэшируется и «аватарки нет» (`null`): иначе каждая
 * карточка архива заново ходила бы на сервер, а сервер — в Telegram.
 * Сетевой сбой бросает ошибку и в кэш не попадает. */
async function loadAvatar(userId: number): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/api/avatar/${userId}`, {
    headers: initDataHeader(),
  });
  return res.ok ? URL.createObjectURL(await res.blob()) : null;
}

export function useAvatar(userId: number): string | null {
  const { data } = useQuery({
    queryKey: queryKeys.avatar(userId),
    queryFn: () => loadAvatar(userId),
    staleTime: Infinity,
    gcTime: Infinity, // object URL не отзываем: один маленький файл на собеседника
  });
  return data ?? null;
}
