import { useSyncExternalStore } from 'react';
import { readSystemDark } from '../lib/telegramTheme';

function subscribe(onChange: () => void) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}

export function useSystemDark(): boolean {
  return useSyncExternalStore(subscribe, readSystemDark, () => false);
}
