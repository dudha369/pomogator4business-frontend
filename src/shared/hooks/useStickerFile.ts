import { useEffect, useState } from 'react';

import { apiGetBlob } from '@/shared/api/client';
import { acquireMedia, peekMedia, releaseMedia } from '@/shared/lib/mediaCache';

export type StickerFormat = 'tgs' | 'webm' | 'webp';

export type StickerFileState =
  | { status: 'loading' }
  | { status: 'ready'; url: string; format: StickerFormat }
  | { status: 'error' };

/** Формат приходит в Content-Type ответа; object URL его не хранит,
 * поэтому запоминаем рядом (запись живёт столько же, сколько URL в mediaCache). */
const formats = new Map<string, StickerFormat>();

function toFormat(mime: string): StickerFormat {
  if (mime === 'application/x-tgsticker') return 'tgs';
  return mime === 'video/webm' ? 'webm' : 'webp';
}

function readyState(key: string): StickerFileState | undefined {
  const url = peekMedia(key);
  const format = formats.get(key);
  return url && format ? { status: 'ready', url, format } : undefined;
}

/** Файл стикера или эмодзи по адресу API (`/api/custom-emoji/…`, `/api/ui-stickers/…`).
 * Запросы одного адреса делятся (mediaCache); ошибка — не повод ломать экран:
 * вызывающий покажет запасной вариант. */
export function useStickerFile(path: string): StickerFileState {
  const key = `sticker:${path}`;
  const [state, setState] = useState<StickerFileState>(
    () => readyState(key) ?? { status: 'loading' },
  );

  useEffect(() => {
    let cancelled = false;
    setState(readyState(key) ?? { status: 'loading' });
    acquireMedia(key, async () => {
      const blob = await apiGetBlob(path);
      formats.set(key, toFormat(blob.type));
      return blob;
    })
      .then(() => {
        const ready = readyState(key);
        if (!cancelled) setState(ready ?? { status: 'error' });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error' });
      });
    return () => {
      cancelled = true;
      releaseMedia(key);
    };
  }, [key, path]);

  return state;
}
