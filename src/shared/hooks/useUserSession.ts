import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { localeApi } from '../api/locale';
import { onUnauthorized } from '../api/request';
import { isInTelegram } from '../lib/telegramEnv';
import { getApiStatus, getApiReason, isNetworkError } from '../lib/apiErrors';
import type { LocaleCode } from '@/i18n/types';

export const SESSION_QUERY_KEY = ['session'] as const;

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
    queryKey: SESSION_QUERY_KEY,
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

  if (!ready || (inTelegram && isLoading)) return { status: 'booting' };
  if (!inTelegram) return { status: 'auth_error' };
  if (expired || getApiStatus(error) === 401) {
    return { status: 'session_expired' };
  }
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
