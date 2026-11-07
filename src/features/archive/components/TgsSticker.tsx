import { useEffect, useRef, useState } from 'react';

interface Props {
  /** object URL с байтами .tgs (gzip-архив с Lottie-JSON) */
  url: string;
  /** что показать, если анимацию отрисовать не удалось */
  fallback?: string;
  className?: string;
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
}: Props) {
  const container = useRef<HTMLDivElement>(null);
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
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [url]);

  if (failed) {
    return <div className="py-4 text-center text-6xl">{fallback}</div>;
  }
  return <div className={className} ref={container} />;
}
