import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchAccount,
  syncTimezoneName,
  toggleEmojiStatus,
  updateEmojiStatusStyle,
  updateTimezone,
} from '@/features/account/api';
import type { AccountResponse } from '@/features/account/types';
import { queryKeys } from '@/shared/api/queryKeys';

export const useAccount = () =>
  useQuery({ queryKey: queryKeys.account, queryFn: fetchAccount });

/** Чтение и правка закэшированного аккаунта: на этом построены оптимистичные обновления. */
function useAccountCache() {
  const queryClient = useQueryClient();
  return {
    queryClient,
    get: () => queryClient.getQueryData<AccountResponse>(queryKeys.account),
    patch: (change: (account: AccountResponse) => AccountResponse) =>
      queryClient.setQueryData<AccountResponse>(
        queryKeys.account,
        (prev) => prev && change(prev),
      ),
  };
}

export function useToggleEmojiStatus() {
  const { queryClient, patch } = useAccountCache();
  const set = (enabled: boolean) =>
    patch((a) => ({ ...a, emoji_status: { ...a.emoji_status, enabled } }));
  return useMutation({
    mutationFn: async (enabled: boolean) =>
      (await toggleEmojiStatus(enabled)).enabled,
    onMutate: set,
    onError: (_error, enabled) => set(!enabled),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.home }),
  });
}

export function useChangeClockStyle() {
  const { get, patch } = useAccountCache();
  const set = (style: string) =>
    patch((a) => ({ ...a, emoji_status: { ...a.emoji_status, style } }));
  return useMutation({
    mutationFn: updateEmojiStatusStyle,
    onMutate: (style) => {
      const previous = get()?.emoji_status.style;
      set(style);
      return { previous };
    },
    onError: (_error, _style, context) => {
      if (context?.previous) set(context.previous);
    },
  });
}

export function useChangeTimezone() {
  const { get, patch } = useAccountCache();
  return useMutation({
    mutationFn: updateTimezone,
    onMutate: (offsetMinutes) => {
      const previous = get();
      patch((a) => ({
        ...a,
        timezone_offset_minutes: offsetMinutes,
        timezone: null,
      }));
      return { previous };
    },
    onError: (_error, _offset, context) => {
      const previous = context?.previous;
      if (!previous) return;
      patch((a) => ({
        ...a,
        timezone_offset_minutes: previous.timezone_offset_minutes,
        timezone: previous.timezone,
      }));
    },
  });
}

/** Автоматическая отправка пояса устройства; сбой не показываем. */
export function useSyncTimezoneName() {
  const { patch } = useAccountCache();
  return useMutation({
    mutationFn: syncTimezoneName,
    onSuccess: (res) =>
      patch((a) => ({
        ...a,
        timezone_offset_minutes: res.offset_minutes,
        timezone: res.timezone,
      })),
  });
}
