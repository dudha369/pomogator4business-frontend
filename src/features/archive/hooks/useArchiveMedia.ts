import { useEffect, useState } from 'react';

import { apiGetBlob } from '@/shared/api/client';

type MediaState =
  | { status: 'loading' }
  | { status: 'ready'; url: string }
  | { status: 'error' };

export type ArchiveMediaSide = 'auto' | 'old' | 'new';

const cache = new Map<string, string>();

/** Медиа архива нельзя положить в <img src> напрямую — нужен заголовок
 * авторизации, поэтому грузим байты через fetch и отдаём object URL. */
export function useArchiveMedia(
  logId: number,
  which: ArchiveMediaSide = 'auto',
): MediaState {
  const key = `${logId}:${which}`;
  const [state, setState] = useState<MediaState>(() => {
    const cached = cache.get(key);
    return cached ? { status: 'ready', url: cached } : { status: 'loading' };
  });

  useEffect(() => {
    const cached = cache.get(key);
    if (cached) {
      setState({ status: 'ready', url: cached });
      return;
    }
    let cancelled = false;
    setState({ status: 'loading' });
    apiGetBlob(`/api/archive/${logId}/media?which=${which}`)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        cache.set(key, url);
        if (!cancelled) setState({ status: 'ready', url });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [key, logId, which]);

  return state;
}
