import { Clock } from 'lucide-react';

import { RemoteSticker } from '@/shared/ui/RemoteSticker';

/** Живое превью стиля: эмодзи текущей минуты. Красится цветом текста (тема, активный
 * стиль), как Telegram перекрашивает эмодзи. Нет эмодзи или сбой — иконка часов. */
export function ClockStylePreview({ emojiId }: { emojiId: string | null }) {
  const icon = <Clock aria-hidden className="size-12" />;
  if (!emojiId) return icon;
  return (
    <RemoteSticker
      className="size-12"
      fallback={icon}
      path={`/api/custom-emoji/${emojiId}`}
      tint
    />
  );
}
