import { useQuery } from '@tanstack/react-query';

import { fetchDeepPing, measurePing } from '@/features/ping/api';
import { queryKeys } from '@/shared/api/queryKeys';

export type PingState =
  { status: 'loading' } | { status: 'ok'; ms: number } | { status: 'offline' };

/** Периодически замеряет пинг. Пока мини-приложение скрыто, react-query не опрашивает;
 * при возврате замер делается сразу. */
export function usePing(intervalMs = 15000): PingState {
  const { data, isPending } = useQuery({
    queryKey: queryKeys.ping,
    queryFn: () => measurePing(),
    refetchInterval: intervalMs,
    refetchOnWindowFocus: true,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
  if (isPending) return { status: 'loading' };
  return data === null || data === undefined
    ? { status: 'offline' }
    : { status: 'ok', ms: data };
}

/** Задержки БД и Telegram на сервере + аптайм: запрашивается при каждом открытии панели. */
export const useDeepPing = (open: boolean) =>
  useQuery({
    queryKey: queryKeys.pingDeep,
    queryFn: fetchDeepPing,
    enabled: open,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
