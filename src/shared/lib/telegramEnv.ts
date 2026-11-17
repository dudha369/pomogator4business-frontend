import { getInitDataRaw } from '@/shared/api/request';

export function isInTelegram(ready: boolean): boolean {
  if (!ready) return true;
  return !!getInitDataRaw();
}
