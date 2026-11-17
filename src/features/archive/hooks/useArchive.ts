import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useRef } from 'react';

import {
  fetchArchivePage,
  fetchArchivePrefs,
  saveArchivePrefs,
} from '@/features/archive/api';
import type {
  ArchiveFilters,
  ArchivePrefs,
  ArchivePrefsResponse,
} from '@/features/archive/types';
import { queryKeys } from '@/shared/api/queryKeys';

/** Лента архива: страницы подгружаются курсором `before_id`. Смена фильтров —
 * новый ключ запроса, поэтому ответы по старым фильтрам в новый список не попадают.
 * Кэш не держим: при каждом открытии — свежая первая страница. */
export const useArchiveList = (filters: ArchiveFilters) =>
  useInfiniteQuery({
    queryKey: queryKeys.archive(filters),
    queryFn: ({ pageParam }) => fetchArchivePage(filters, pageParam),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (last) =>
      last.has_more ? (last.next_before_id ?? undefined) : undefined,
    select: (data) => data.pages.flatMap((page) => page.entries),
    staleTime: 0,
    gcTime: 0,
  });

/** Настройки уведомлений архива; грузятся, когда открыт лист настроек. */
export const useArchivePrefs = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.archivePrefs,
    queryFn: fetchArchivePrefs,
    enabled,
  });

/** Каждое изменение сразу уходит на бэкенд, бот подхватывает его со следующего
 * уведомления. Номер запроса: ответ на более ранний не должен перебить
 * более свежие переключатели. */
export function useSaveArchivePrefs() {
  const queryClient = useQueryClient();
  const lastRequest = useRef(0);
  const { mutate } = useMutation({
    mutationFn: (patch: Partial<ArchivePrefs>) => saveArchivePrefs(patch),
    onMutate: (patch) => {
      queryClient.setQueryData<ArchivePrefsResponse>(
        queryKeys.archivePrefs,
        (prev) => prev && { ...prev, prefs: { ...prev.prefs, ...patch } },
      );
      return { request: ++lastRequest.current };
    },
    onSuccess: (saved, _patch, context) => {
      if (context.request === lastRequest.current) {
        queryClient.setQueryData(queryKeys.archivePrefs, saved);
      }
    },
    onError: (_error, _patch, context) => {
      // не сохранилось — возвращаем то, что реально хранится на сервере
      if (context?.request === lastRequest.current) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.archivePrefs,
        });
      }
    },
  });
  return mutate;
}
