import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchChats, setFavorite } from '@/features/chats/api';
import type { ChatItem } from '@/features/chats/types';
import { queryKeys } from '@/shared/api/queryKeys';

export const useChats = () =>
  useQuery({ queryKey: queryKeys.chats, queryFn: fetchChats });

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  // меняем только один чат: параллельные переключения других не откатываются
  const apply = (chatId: number, favorite: boolean) =>
    queryClient.setQueryData<ChatItem[]>(queryKeys.chats, (prev) =>
      prev?.map((c) => (c.chat_id === chatId ? { ...c, favorite } : c)),
    );
  return useMutation({
    mutationFn: ({ chatId, favorite }: { chatId: number; favorite: boolean }) =>
      setFavorite(chatId, favorite),
    onMutate: ({ chatId, favorite }) => apply(chatId, favorite),
    onError: (_error, { chatId, favorite }) => apply(chatId, !favorite),
  });
}
