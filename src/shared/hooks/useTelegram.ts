import { useContext } from 'react';
import { TelegramContext } from '../context/TelegramContext';

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) {
    throw new Error('useTelegram must be used inside TelegramRootProvider');
  }
  return ctx;
}
