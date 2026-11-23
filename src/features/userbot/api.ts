import { apiDelete, apiGet, apiPost } from '@/shared/api/client';
import type { UserbotState } from '@/features/userbot/types';

export const fetchUserbot = () => apiGet<UserbotState>('/api/userbot');

export const startUserbotLogin = () =>
  apiPost<UserbotState>('/api/userbot/login', { consent: true });

export const submitUserbotPassword = (password: string) =>
  apiPost<UserbotState>('/api/userbot/login/password', { password });

export const disconnectUserbot = () => apiDelete<UserbotState>('/api/userbot');
