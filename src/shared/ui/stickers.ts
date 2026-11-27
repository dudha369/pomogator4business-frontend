import { Ban, Frown, Sticker, type LucideIcon } from 'lucide-react';

import type { Schema } from '@/shared/api/schema';
import type { StickerFormat } from '@/shared/hooks/useStickerFile';

/** Имена стикеров интерфейса: тип выводится из OpenAPI, то есть из реестра бэкенда. */
export type StickerName = Schema<'StickerName'>;

/** Запасная иконка, пока стикер грузится или если не загрузился. Необязательна:
 * для имени без записи берётся `DEFAULT_FALLBACK`. */
export const STICKER_FALLBACK: Partial<Record<StickerName, LucideIcon>> = {
  error_forbidden: Ban,
  error_crying: Frown,
};
export const DEFAULT_FALLBACK: LucideIcon = Sticker;

const FORMATS: Record<string, StickerFormat> = {
  tgs: 'tgs',
  webm: 'webm',
  webp: 'webp',
};

/** Файлы из `src/assets/stickers/<имя>.<tgs|webm|webp>` входят в сборку и показываются
 * без сети: так работает экран «нет соединения». Нет файла — стикер берётся из API. */
const bundled = import.meta.glob<string>('/src/assets/stickers/*', {
  query: '?url',
  import: 'default',
  eager: true,
});

export function embeddedSticker(
  name: string,
): { url: string; format: StickerFormat } | undefined {
  for (const [path, url] of Object.entries(bundled)) {
    const match = /([^/]+)\.(\w+)$/.exec(path);
    if (match?.[1] === name && FORMATS[match[2]]) {
      return { url, format: FORMATS[match[2]] };
    }
  }
  return undefined;
}
