import { useEffect, useState } from "react";

import { API_BASE_URL, initDataHeader } from "@/shared/api/client";

const cache = new Map<number, string>();

/** <img src> не умеет слать заголовки авторизации — грузим байты вручную
 * через fetch и превращаем в object URL. Простейший in-memory кэш на время
 * жизни вкладки, чтобы не перезапрашивать одну и ту же аватарку на каждый
 * рендер карточки архива. */
export function useAvatar(userId: number): string | null {
  const [url, setUrl] = useState<string | null>(cache.get(userId) ?? null);

  useEffect(() => {
    if (cache.has(userId)) {
      setUrl(cache.get(userId)!);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE_URL}/api/avatar/${userId}`, { headers: initDataHeader() })
    .then((res) => (res.ok ? res.blob() : null))
    .then((blob) => {
      if (cancelled || !blob) return;
      const objectUrl = URL.createObjectURL(blob);
      cache.set(userId, objectUrl);
      setUrl(objectUrl);
    })
    .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return url;
}
