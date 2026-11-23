import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  disconnectUserbot,
  fetchUserbot,
  startUserbotLogin,
  submitUserbotPassword,
} from '@/features/userbot/api';
import type { UserbotState } from '@/features/userbot/types';
import { queryKeys } from '@/shared/api/queryKeys';

const POLL_MS = 2000;
const POLLING_STATUSES: readonly UserbotState['status'][] = [
  'login',
  'connecting',
  'removing',
];

/** Пока идёт вход, подключение или отключение — опрашиваем сервер (QR обновляется сам). */
export const useUserbot = () =>
  useQuery({
    queryKey: queryKeys.userbot,
    queryFn: fetchUserbot,
    refetchInterval: (query) =>
      query.state.data && POLLING_STATUSES.includes(query.state.data.status)
        ? POLL_MS
        : false,
  });

/** Все три действия возвращают полное состояние: кладём его в кэш как есть. */
function useUserbotAction<V>(fn: (variables: V) => Promise<UserbotState>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (state) => {
      queryClient.setQueryData(queryKeys.userbot, state);
    },
  });
}

export const useStartUserbotLogin = () =>
  useUserbotAction<void>(startUserbotLogin);

export const useSubmitUserbotPassword = () =>
  useUserbotAction<string>(submitUserbotPassword);

export const useDisconnectUserbot = () =>
  useUserbotAction<void>(disconnectUserbot);
