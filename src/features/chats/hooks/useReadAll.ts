import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { fetchReadAllStatus, readAll } from '@/features/chats/api';
import type { ReadAllRequest } from '@/features/chats/types';
import { queryKeys } from '@/shared/api/queryKeys';

const POLL_MS = 2000;
// три сбоя опроса подряд = «потеряли задачу»
const POLL_RETRIES = 2;

/** Прогресс фоновой задачи: пока она идёт, опрашиваем раз в 2 с. Бэкенд ждёт
 * ответа ≤ 20 с, дальше работает в фоне — поэтому статус нужен и при возврате
 * на страницу. */
export const useReadAllStatus = () =>
  useQuery({
    queryKey: queryKeys.readAllStatus,
    queryFn: fetchReadAllStatus,
    staleTime: 0,
    retry: POLL_RETRIES,
    retryDelay: POLL_MS,
    refetchInterval: (query) =>
      query.state.data?.running && query.state.status !== 'error'
        ? POLL_MS
        : false,
  });

/** Запуск: ответ кладём в тот же кэш, что и статус, — дальше им управляет опрос. */
export function useReadAllRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readAll,
    onSuccess: (result) =>
      queryClient.setQueryData(queryKeys.readAllStatus, result),
  });
}

/** Предпросмотр: сколько чатов подойдёт под фильтр (`null` — запроса нет). */
export const useReadAllPreview = (request: ReadAllRequest | null) =>
  useQuery({
    queryKey: queryKeys.readAllPreview(request),
    queryFn: () => readAll({ ...request, dry_run: true }),
    enabled: request !== null,
    staleTime: 0,
    retry: false,
    placeholderData: keepPreviousData,
  });
