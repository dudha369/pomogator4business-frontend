import { type ReactNode, useState } from 'react';

import { RemoteSticker } from '@/shared/ui/RemoteSticker';
import { StickerPlayer } from '@/shared/ui/StickerPlayer';
import {
  DEFAULT_FALLBACK,
  embeddedSticker,
  STICKER_FALLBACK,
  type StickerName,
} from '@/shared/ui/stickers';

interface Props {
  name: StickerName;
  /** сторона квадрата, px */
  size?: number;
  /** вместо иконки по умолчанию */
  fallback?: ReactNode;
}

/** Стикер интерфейса по смысловому имени из реестра бэкенда. Файл из сборки
 * (работает без сети) или из API; нет файла или сбой — запасная иконка. */
export function Sticker({ name, size = 96, fallback }: Props) {
  const Icon = STICKER_FALLBACK[name] ?? DEFAULT_FALLBACK;
  const placeholder = fallback ?? <Icon aria-hidden size={size * 0.6} />;
  const box = { width: size, height: size };
  const className = 'mx-auto block object-contain';
  const [broken, setBroken] = useState(false);
  const embedded = embeddedSticker(name);

  const content =
    embedded && !broken ? (
      <StickerPlayer
        className={className}
        format={embedded.format}
        onError={() => setBroken(true)}
        url={embedded.url}
      />
    ) : (
      <RemoteSticker
        className={className}
        fallback={placeholder}
        path={`/api/ui-stickers/${name}`}
      />
    );

  return (
    <div
      className="flex items-center justify-center"
      data-sticker={name}
      style={box}
    >
      {content}
    </div>
  );
}
