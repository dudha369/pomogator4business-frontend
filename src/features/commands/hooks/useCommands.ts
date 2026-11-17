import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createUserAlias,
  deleteUserAlias,
  fetchCommands,
  fetchUserAliases,
} from '@/features/commands/api';
import type { UserAlias } from '@/features/commands/types';
import { queryKeys } from '@/shared/api/queryKeys';

export const useCommands = (locale: string) =>
  useQuery({
    queryKey: queryKeys.commands(locale),
    queryFn: () => fetchCommands(locale),
  });

/** Свои алиасы — необязательная часть: если запрос упал, список просто пуст. */
export function useUserAliases(): UserAlias[] {
  const { data } = useQuery({
    queryKey: queryKeys.aliases,
    queryFn: fetchUserAliases,
  });
  return data ?? [];
}

export function useCreateAlias() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ command, alias }: { command: string; alias: string }) =>
      createUserAlias(command, alias),
    onSuccess: (created) =>
      queryClient.setQueryData<UserAlias[]>(queryKeys.aliases, (prev) => [
        ...(prev ?? []),
        created,
      ]),
  });
}

export function useDeleteAlias() {
  const queryClient = useQueryClient();
  const set = (update: (aliases: UserAlias[]) => UserAlias[]) =>
    queryClient.setQueryData<UserAlias[]>(queryKeys.aliases, (prev) =>
      update(prev ?? []),
    );
  return useMutation({
    mutationFn: deleteUserAlias,
    onMutate: (alias) => {
      const previous = queryClient.getQueryData<UserAlias[]>(queryKeys.aliases);
      set((aliases) => aliases.filter((a) => a.alias !== alias));
      return { previous };
    },
    onError: (_error, _alias, context) => {
      if (context?.previous) set(() => context.previous!);
    },
  });
}
