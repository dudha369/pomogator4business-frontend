import { useEffect, useState } from 'react';

import { apiGetBlob } from '@/shared/api/client';
import { acquireMedia, peekMedia, releaseMedia } from './mediaCache';

type MediaState =
  | { status: 'loading' }
  | { status: 'ready'; url: string }
  | { status: 'error' };

export type ArchiveMediaSide = 'auto' | 'old' | 'new';

/** Медиа архива нельзя положить в <img src> напрямую — нужен заголовок
 * авторизации, поэтому грузим байты через fetch и отдаём object URL.
 * URL живёт в mediaCache, пока хотя бы один компонент им пользуется. */
export function useArchiveMedia(
  logId: number,
  which: ArchiveMediaSide = 'auto',
): MediaState {
  const key = `${logId}:${which}`;
  const [state, setState] = useState<MediaState>(() => {
    const cached = peekMedia(key);
    return cached ? { status: 'ready', url: cached } : { status: 'loading' };
  });

  useEffect(() => {
    let cancelled = false;
    const cached = peekMedia(key);
    setState(cached ? { status: 'ready', url: cached } : { status: 'loading' });
    acquireMedia(key, () =>
      apiGetBlob(`/api/archive/${logId}/media?which=${which}`),
    )
      .then((url) => {
        if (!cancelled) setState({ status: 'ready', url });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
      releaseMedia(key);
    };
  }, [key, logId, which]);

  return state;
}
