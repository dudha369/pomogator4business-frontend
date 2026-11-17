import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  connectMirror,
  disconnectMirror,
  fetchMirrorStatus,
  fetchSettings,
  setModuleEnabled,
  updatePrefix,
} from '@/features/settings/api';
import type { MirrorStatus, SettingsResponse } from '@/features/settings/types';
import { queryKeys } from '@/shared/api/queryKeys';

/** Префикс и модули — один запрос `/api/settings` на Команды и Настройки. */
export const useSettings = () =>
  useQuery({ queryKey: queryKeys.settings, queryFn: fetchSettings });

export const useMirror = () =>
  useQuery({ queryKey: queryKeys.mirror, queryFn: fetchMirrorStatus });

export function useUpdatePrefix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePrefix,
    onSuccess: (prefix) =>
      queryClient.setQueryData<SettingsResponse>(
        queryKeys.settings,
        (prev) => prev && { ...prev, prefix },
      ),
  });
}

function useMirrorMutation<V>(
  mutationFn: (variables: V) => Promise<MirrorStatus>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (status) => {
      queryClient.setQueryData<MirrorStatus>(queryKeys.mirror, status);
      void queryClient.invalidateQueries({ queryKey: queryKeys.home });
      void queryClient.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}

export const useConnectMirror = () => useMirrorMutation(connectMirror);

export const useDisconnectMirror = () =>
  useMirrorMutation<void>(async () => {
    await disconnectMirror();
    return { connected: false, username: null, running: false };
  });

export function useToggleModule() {
  const queryClient = useQueryClient();
  const set = (module: string, enabled: boolean) =>
    queryClient.setQueryData<SettingsResponse>(
      queryKeys.settings,
      (prev) =>
        prev && {
          ...prev,
          modules: prev.modules.map((m) =>
            m.name === module ? { ...m, enabled } : m,
          ),
        },
    );
  return useMutation({
    mutationFn: ({ module, enabled }: { module: string; enabled: boolean }) =>
      setModuleEnabled(module, enabled),
    onMutate: ({ module, enabled }) => set(module, enabled),
    onError: (_error, { module, enabled }) => set(module, !enabled),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.home }),
  });
}
