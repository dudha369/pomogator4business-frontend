import { apiGet, apiPost } from '@/shared/api/client';
import type { Schema } from '@/shared/api/schema';
import type { AccountResponse } from '@/features/account/types';

export const fetchAccount = () => apiGet<AccountResponse>('/api/account');

/** Отправить IANA-имя пояса; сервер сам считает смещение с учётом летнего времени. */
export const syncTimezoneName = (timezone: string) =>
  apiPost<Schema<'TimezoneOut'>>('/api/account/timezone', { timezone });

export const updateTimezone = (offsetMinutes: number) =>
  apiPost<Schema<'TimezoneOut'>>('/api/account/timezone', {
    offset_minutes: offsetMinutes,
  });

export const updateEmojiStatusStyle = (style: string) =>
  apiPost<Schema<'EmojiStatusStyle'>>('/api/settings/emoji-status/style', {
    style,
  });

export const toggleEmojiStatus = (enabled: boolean) =>
  apiPost<Schema<'EmojiStatusToggle'>>('/api/settings/emoji-status', {
    enabled,
  });
