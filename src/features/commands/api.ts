import { apiDelete, apiGet, apiPost } from '@/shared/api/client';
import type { Schema } from '@/shared/api/schema';
import type { Command, UserAlias } from '@/features/commands/types';

export async function fetchCommands(locale: string): Promise<Command[]> {
  const res = await apiGet<{ commands: Command[] }>(
    `/api/commands?locale=${locale}`,
  );
  return [...res.commands].sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchUserAliases(): Promise<UserAlias[]> {
  return (await apiGet<Schema<'AliasesOut'>>('/api/aliases')).aliases;
}

export const createUserAlias = (command: string, alias: string) =>
  apiPost<UserAlias>('/api/aliases', { command, alias });

export const deleteUserAlias = (alias: string) =>
  apiDelete<Schema<'Deleted'>>(`/api/aliases/${encodeURIComponent(alias)}`);
