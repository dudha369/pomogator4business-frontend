import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  dismissAlert,
  fetchAlerts,
  muteAlert,
  unmuteAlert,
} from '@/features/alerts/api';
import { queryKeys } from '@/shared/api/queryKeys';

export const useAlerts = () =>
  useQuery({ queryKey: queryKeys.alerts, queryFn: fetchAlerts });

/** Любое изменение списка предупреждений меняет и счётчик на Главной. */
function useAlertMutation<TVariables>(
  fn: (variables: TVariables) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home }),
      ]),
  });
}

export const useDismissAlert = () => useAlertMutation(dismissAlert);
export const useMuteAlert = () => useAlertMutation(muteAlert);
export const useUnmuteAlert = () => useAlertMutation(unmuteAlert);
