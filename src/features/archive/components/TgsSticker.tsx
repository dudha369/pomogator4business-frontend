import { useEffect, useRef, useState } from 'react';

interface Props {
  /** object URL с байтами .tgs (gzip-архив с Lottie-JSON) */
  url: string;
  /** что показать, если анимацию отрисовать не удалось */
  fallback?: string;
  className?: string;
  /** вызывается, если анимацию отрисовать не удалось (вместо своей заглушки) */
  onError?: () => void;
  /** `<span>` вместо `<div>`: для эмодзи внутри абзаца (div в p недопустим) */
  inline?: boolean;
}

async function gunzip(buffer: ArrayBuffer): Promise<string> {
  const stream = new Blob([buffer])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

/** Анимированный стикер Telegram (.tgs). Библиотека грузится только когда
 * такой стикер реально открыли, чтобы не утяжелять остальной интерфейс. */
export function TgsSticker({
  url,
  fallback = '🖼',
  className = 'mx-auto size-40',
  onError,
  inline = false,
}: Props) {
  const container = useRef<HTMLElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let destroy: (() => void) | undefined;

    (async () => {
      try {
        const [{ default: lottie }, buffer] = await Promise.all([
          import('lottie-web/build/player/lottie_light'),
          fetch(url).then((response) => response.arrayBuffer()),
        ]);
        const animationData = JSON.parse(await gunzip(buffer));
        if (cancelled || !container.current) return;
        const animation = lottie.loadAnimation({
          container: container.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData,
        });
        destroy = () => animation.destroy();
      } catch {
        if (cancelled) return;
        setFailed(true);
        onError?.();
      }
    })();

    return () => {
      cancelled = true;
      destroy?.();
    };
    // onError не в зависимостях: смена колбэка не должна перезапускать анимацию
  }, [url]);

  if (failed) {
    return <div className="py-4 text-center text-6xl">{fallback}</div>;
  }
  const Tag = inline ? 'span' : 'div';
  return <Tag className={className} ref={container as never} />;
}
