import type { ReactNode } from 'react';

import { RemoteSticker } from '@/shared/ui/RemoteSticker';

const SIZE = 'inline-block size-[1.25em] align-text-bottom';

/** Премиум-эмодзи Telegram внутри текста. Пока файл грузится и если он не
 * загрузился или не отрисовался — остаётся обычный символ (`children`). */
export function CustomEmoji({
  emojiId,
  children,
}: {
  emojiId: string;
  children: ReactNode;
}) {
  return (
    <RemoteSticker
      className={SIZE}
      fallback={children}
      inline
      path={`/api/custom-emoji/${emojiId}`}
    />
  );
}
