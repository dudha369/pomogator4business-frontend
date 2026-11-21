import { type ReactNode, useState } from 'react';

import { TgsSticker } from '@/features/archive/components/TgsSticker';
import { useCustomEmoji } from '@/features/archive/hooks/useCustomEmoji';

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
  const emoji = useCustomEmoji(emojiId);
  const [broken, setBroken] = useState(false);

  if (emoji.status !== 'ready' || broken) return <>{children}</>;
  if (emoji.format === 'tgs') {
    return (
      <TgsSticker
        inline
        className={SIZE}
        onError={() => setBroken(true)}
        url={emoji.url}
      />
    );
  }
  if (emoji.format === 'webm') {
    return (
      <video
        aria-hidden
        autoPlay
        className={SIZE}
        loop
        muted
        onError={() => setBroken(true)}
        playsInline
        src={emoji.url}
      />
    );
  }
  return (
    <img
      alt=""
      className={SIZE}
      onError={() => setBroken(true)}
      src={emoji.url}
    />
  );
}
