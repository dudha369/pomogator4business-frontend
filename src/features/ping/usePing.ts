import { useEffect, useState } from 'react';

import { measurePing } from './api';

export type PingState =
  { status: 'loading' } | { status: 'ok'; ms: number } | { status: 'offline' };

/** Периодически замеряет пинг. Пока вкладка/мини-приложение скрыто — не мерит. */
export function usePing(intervalMs = 15000): PingState {
  const [state, setState] = useState<PingState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    let running = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    async function tick() {
      if (running) return;
      running = true;
      try {
        if (!document.hidden) {
          const ms = await measurePing();
          if (cancelled) return;
          setState(ms === null ? { status: 'offline' } : { status: 'ok', ms });
        }
      } finally {
        running = false;
      }
      if (!cancelled) timer = setTimeout(tick, intervalMs);
    }

    function onVisibilityChange() {
      if (!document.hidden) {
        clearTimeout(timer);
        void tick();
      }
    }

    void tick();
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs]);

  return state;
}
