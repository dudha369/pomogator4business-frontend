import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/api/queryKeys';
import { localeApi } from '@/shared/api/locale';
import {
  onBlocked,
  onUnauthorized,
  type BlockedReason,
} from '@/shared/api/request';
import { isInTelegram } from '@/shared/lib/telegramEnv';
import {
  getApiReason,
  getApiStatus,
  isNetworkError,
} from '@/shared/lib/apiErrors';
import type { LocaleCode } from '@/shared/i18n/types';

export type SessionState =
  | { status: 'booting' }
  | { status: 'auth_error' }
  | { status: 'session_expired' }
  | { status: 'access_denied' }
  | { status: 'maintenance' }
  | { status: 'error'; kind: 'network' | 'general'; retry: () => void }
  | { status: 'ready'; locale: LocaleCode };

export function useSessionQuery(ready: boolean) {
  const inTelegram = useMemo(() => isInTelegram(ready), [ready]);

  const query = useQuery({
    queryKey: queryKeys.session,
    queryFn: ({ signal }) => localeApi.get(signal),
    enabled: ready && inTelegram,
  });

  return { ...query, inTelegram };
}

export function useUserSession(ready: boolean): SessionState {
  const { data, error, isLoading, refetch, inTelegram } =
    useSessionQuery(ready);

  const [expired, setExpired] = useState(false);
  useEffect(() => onUnauthorized(() => setExpired(true)), []);
  const [blocked, setBlocked] = useState<BlockedReason | null>(null);
  useEffect(() => onBlocked(setBlocked), []);

  if (!ready || (inTelegram && isLoading)) return { status: 'booting' };
  if (!inTelegram) return { status: 'auth_error' };
  if (expired || getApiStatus(error) === 401) {
    return { status: 'session_expired' };
  }
  if (blocked) return { status: blocked };
  if (getApiStatus(error) === 403) return { status: 'access_denied' };
  if (
    getApiStatus(error) === 503 &&
    getApiReason(error) === 'maintenance_mode'
  ) {
    return { status: 'maintenance' };
  }
  if (error || !data) {
    return {
      status: 'error',
      kind: isNetworkError(error) ? 'network' : 'general',
      retry: () => void refetch(),
    };
  }

  return { status: 'ready', locale: data.locale };
}
