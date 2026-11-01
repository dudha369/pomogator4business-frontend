import { createContext } from 'react';

export type TelegramState = {
  ready: boolean;
  safeTop: number;
  safeBottom: number;
};

export const TelegramContext = createContext<TelegramState | null>(null);
