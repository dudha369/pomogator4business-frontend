import { apiGet, apiPost } from '@/shared/api/client';
import type { Schema } from '@/shared/api/schema';
import type { MirrorStatus, SettingsResponse } from '@/features/settings/types';

export const fetchSettings = () => apiGet<SettingsResponse>('/api/settings');

export const updatePrefix = async (prefix: string) =>
  (await apiPost<Schema<'PrefixOut'>>('/api/settings/prefix', { prefix }))
    .prefix;

export const fetchMirrorStatus = () => apiGet<MirrorStatus>('/api/mirror');

export async function connectMirror(token: string): Promise<MirrorStatus> {
  // 200 приходит только после успешного запуска зеркала
  const res = await apiPost<Schema<'MirrorStatus'>>('/api/mirror/connect', {
    token,
  });
  return { ...res, running: true };
}

export const disconnectMirror = () =>
  apiPost<Schema<'MirrorDisconnected'>>('/api/mirror/disconnect', {});

export const setModuleEnabled = (module: string, enabled: boolean) =>
  apiPost<Schema<'ModuleToggle'>>('/api/settings/module', { module, enabled });
