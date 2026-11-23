import { useEffect, useState } from 'react';

import { apiGetBlob } from '@/shared/api/client';
import {
  acquireMedia,
  peekMedia,
  releaseMedia,
} from '@/features/archive/hooks/mediaCache';

type EmojiFormat = 'tgs' | 'webm' | 'webp';

export type CustomEmojiState =
  | { status: 'loading' }
  | { status: 'ready'; url: string; format: EmojiFormat }
  | { status: 'error' };

/** Формат приходит в Content-Type ответа; object URL его не хранит,
 * поэтому запоминаем рядом (запись живёт столько же, сколько URL в mediaCache). */
const formats = new Map<string, EmojiFormat>();

function toFormat(mime: string): EmojiFormat {
  if (mime === 'application/x-tgsticker') return 'tgs';
  return mime === 'video/webm' ? 'webm' : 'webp';
}

function readyState(key: string): CustomEmojiState | undefined {
  const url = peekMedia(key);
  const format = formats.get(key);
  return url && format ? { status: 'ready', url, format } : undefined;
}

/** Файл кастомного эмодзи по id. Запросы одного id делятся (mediaCache),
 * ошибка — не повод ломать текст: компонент покажет обычный символ. */
export function useCustomEmoji(emojiId: string): CustomEmojiState {
  const key = `emoji:${emojiId}`;
  const [state, setState] = useState<CustomEmojiState>(
    () => readyState(key) ?? { status: 'loading' },
  );

  useEffect(() => {
    let cancelled = false;
    setState(readyState(key) ?? { status: 'loading' });
    acquireMedia(key, async () => {
      const blob = await apiGetBlob(`/api/custom-emoji/${emojiId}`);
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
  }, [key, emojiId]);

  return state;
}
