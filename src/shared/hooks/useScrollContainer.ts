import { useContext } from 'react';
import { ScrollContainerContext } from '@/shared/context/ScrollContainerContext';

export function useScrollContainer() {
  const ctx = useContext(ScrollContainerContext);
  if (!ctx) {
    throw new Error('useScrollContainer must be used within App');
  }
  return ctx;
}
