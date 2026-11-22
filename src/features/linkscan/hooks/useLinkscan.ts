import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchLinkscan, updateLinkscan } from '@/features/linkscan/api';
import type { LinkscanState, LinkscanUpdate } from '@/features/linkscan/types';
import { queryKeys } from '@/shared/api/queryKeys';

export const useLinkscan = () =>
  useQuery({ queryKey: queryKeys.linkscan, queryFn: fetchLinkscan });

const MUTATION_KEY = ['linkscan', 'update'] as const;

/** Переключатель сразу показывает выбор (оптимистично); при ошибке откат.
 * Ответы сервера не пишем в кэш: при быстрых нажатиях они приходят не по порядку.
 * Когда в пути последний запрос — перечитываем настоящее состояние. */
export function useUpdateLinkscan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: updateLinkscan,
    onMutate: async (update: LinkscanUpdate) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.linkscan });
      const previous = queryClient.getQueryData<LinkscanState>(
        queryKeys.linkscan,
      );
      queryClient.setQueryData<LinkscanState>(queryKeys.linkscan, (state) =>
        state
          ? {
              ...state,
              ...(update.enabled != null && { enabled: update.enabled }),
              ...(update.scope != null && { scope: update.scope }),
              ...(update.external != null && { external: update.external }),
              ...(update.chats != null && { chats: update.chats }),
            }
          : state,
      );
      return { previous };
    },
    onError: (_error, _update, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.linkscan, context.previous);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: MUTATION_KEY }) === 1) {
        return queryClient.invalidateQueries({ queryKey: queryKeys.linkscan });
      }
    },
  });
}
