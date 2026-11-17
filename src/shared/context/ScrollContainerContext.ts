import { createContext, type RefObject } from 'react';

export const ScrollContainerContext =
  createContext<RefObject<HTMLElement | null> | null>(null);
