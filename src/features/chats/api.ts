import { apiGet, apiPost } from '@/shared/api/client';
import type { Schema } from '@/shared/api/schema';
import type {
  ChatItem,
  ReadAllRequest,
  ReadAllResult,
} from '@/features/chats/types';

export async function fetchChats(): Promise<ChatItem[]> {
  return (await apiGet<Schema<'ChatsOut'>>('/api/chats')).chats;
}

export const setFavorite = (chatId: number, favorite: boolean) =>
  apiPost<Schema<'FavoriteOut'>>('/api/favorites', {
    chat_id: chatId,
    favorite,
  });

export const fetchReadAllStatus = () =>
  apiGet<ReadAllResult>('/api/readall/status');

export const readAll = (request: ReadAllRequest) =>
  apiPost<ReadAllResult>('/api/readall', request);
