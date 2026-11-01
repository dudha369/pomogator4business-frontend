import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTelegramInit } from '@/shared/hooks/useTelegramInit';
import { useTelegramLayout } from '@/shared/hooks/useTelegramLayout';
import { TelegramContext } from '@/shared/context/TelegramContext';

export function TelegramRootProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  const handleReady = useCallback(() => setReady(true), []);
  useTelegramInit(handleReady);

  const { top, bottom } = useTelegramLayout(ready);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--safe-top', `${top}px`);
    root.style.setProperty('--safe-bottom', `${bottom}px`);
  }, [top, bottom]);

  const value = useMemo(
    () => ({ ready, safeTop: top, safeBottom: bottom }),
    [ready, top, bottom],
  );

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}
