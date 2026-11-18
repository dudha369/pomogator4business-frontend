import { apiDelete, apiGet, apiPost } from '@/shared/api/client';
import type { Schema } from '@/shared/api/schema';

export const fetchAlerts = () => apiGet<Schema<'AlertsOut'>>('/api/alerts');

export const dismissAlert = (id: number) =>
  apiPost<Schema<'AlertDismissed'>>(`/api/alerts/${id}/dismiss`, {});

export const muteAlert = (id: number) =>
  apiPost<Schema<'AlertMuted'>>(`/api/alerts/${id}/mute`, {});

export const unmuteAlert = (code: string) =>
  apiDelete<Schema<'AlertUnmuted'>>(
    `/api/alerts/mutes/${encodeURIComponent(code)}`,
  );
