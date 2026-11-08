import { useEffect, useState } from 'react';

import { API_BASE_URL, initDataHeader } from '@/shared/api/client';

/** userId → запрос (или его результат). Хранится и «аватарки нет» (null):
 * иначе каждая карточка архива того же собеседника заново ходила бы на сервер,
 * а сервер — в Telegram. Одновременные запросы тоже объединяются в один. */
const requests = new Map<number, Promise<string | null>>();

function loadAvatar(userId: number): Promise<string | null> {
  let request = requests.get(userId);
  if (!request) {
    request = fetch(`${API_BASE_URL}/api/avatar/${userId}`, {
      headers: initDataHeader(),
    })
      .then((res) => (res.ok ? res.blob() : null))
      .then((blob) => (blob ? URL.createObjectURL(blob) : null))
      .catch(() => {
        requests.delete(userId); // сетевой сбой — пусть следующая попытка повторит
        return null;
      });
    requests.set(userId, request);
  }
  return request;
}

/** <img src> не умеет слать заголовки авторизации — грузим байты вручную
 * через fetch и превращаем в object URL. */
export function useAvatar(userId: number): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadAvatar(userId).then((objectUrl) => {
      if (!cancelled) setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return url;
}
