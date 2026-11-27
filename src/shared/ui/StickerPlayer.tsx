import type { StickerFormat } from '@/shared/hooks/useStickerFile';
import { usePrefersReducedMotion } from '@/shared/hooks/usePrefersReducedMotion';
import { cn } from '@/shared/lib/cn';
import { TgsSticker } from '@/shared/ui/TgsSticker';

interface Props {
  url: string;
  format: StickerFormat;
  className?: string;
  /** `<span>` вместо `<div>` у tgs: для вставки в абзац */
  inline?: boolean;
  /** закрасить цветом текста (для одноцветных webp, как PNG-маска) */
  tint?: boolean;
  /** вызывается, если файл не отрисовался */
  onError?: () => void;
}

/** Рисует готовый файл стикера по формату. Без анимации, если она отключена в системе. */
export function StickerPlayer({
  url,
  format,
  className,
  inline,
  tint,
  onError,
}: Props) {
  const still = usePrefersReducedMotion();

  if (format === 'tgs') {
    return (
      <TgsSticker
        className={className}
        inline={inline}
        onError={onError}
        still={still}
        url={url}
      />
    );
  }
  if (format === 'webm') {
    return (
      <video
        aria-hidden
        autoPlay={!still}
        className={className}
        loop
        muted
        onError={onError}
        playsInline
        // #t=0.001: без анимации браузер показывает первый кадр, а не чёрный квадрат
        src={still ? `${url}#t=0.001` : url}
      />
    );
  }
  if (tint) {
    return (
      <span
        aria-hidden
        className={cn('bg-current', className)}
        style={{
          WebkitMaskImage: `url(${url})`,
          maskImage: `url(${url})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    );
  }
  return <img alt="" className={className} onError={onError} src={url} />;
}
