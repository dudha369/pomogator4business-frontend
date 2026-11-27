import { type ReactNode, useState } from 'react';

import { useStickerFile } from '@/shared/hooks/useStickerFile';
import { StickerPlayer } from '@/shared/ui/StickerPlayer';

interface Props {
  /** адрес файла в API: `/api/custom-emoji/<id>` или `/api/ui-stickers/<имя>` */
  path: string;
  className?: string;
  inline?: boolean;
  tint?: boolean;
  /** показывается, пока файл грузится и если он не загрузился или не отрисовался */
  fallback: ReactNode;
}

/** Стикер или эмодзи из API. Сбой не ломает экран: остаётся `fallback`. */
export function RemoteSticker({ path, fallback, ...player }: Props) {
  const file = useStickerFile(path);
  const [brokenPath, setBrokenPath] = useState<string>();

  if (file.status !== 'ready' || brokenPath === path) return <>{fallback}</>;
  return (
    <StickerPlayer
      {...player}
      format={file.format}
      onError={() => setBrokenPath(path)}
      url={file.url}
    />
  );
}
