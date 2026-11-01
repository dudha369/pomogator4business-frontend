import { useEffect, useState } from 'react';
import { viewport } from '@tma.js/sdk-react';

type Safe = { top: number; bottom: number };

function readFromSignals(): Safe {
  try {
    const sa = viewport.safeAreaInsets();
    const csa = viewport.contentSafeAreaInsets();
    return {
      top: (sa?.top ?? 0) + (csa?.top ?? 0),
      bottom: (sa?.bottom ?? 0) + (csa?.bottom ?? 0),
    };
  } catch {
    return { top: 0, bottom: 0 };
  }
}

export function useTelegramLayout(ready: boolean): Safe {
  const [safe, setSafe] = useState<Safe>({ top: 0, bottom: 0 });

  useEffect(() => {
    if (!ready) return;

    const update = () => setSafe(readFromSignals());
    update();

    try {
      const unsubSafeArea = viewport.safeAreaInsets.sub(update);
      const unsubContentSafeArea = viewport.contentSafeAreaInsets.sub(update);
      return () => {
        unsubSafeArea();
        unsubContentSafeArea();
      };
    } catch {
      return;
    }
  }, [ready]);

  return safe;
}
