import { apiDelete, apiGet, apiPost, apiPut } from '@/shared/api/client';
import type {
  ArchiveDeleteResult,
  ArchiveFilters,
  ArchivePage,
  ArchivePrefs,
  ArchivePrefsResponse,
  ArchiveRuleBody,
  ArchiveRules,
  DialogKind,
  Plan,
  UserbotDialogs,
} from '@/features/archive/types';

/** "YYYY-MM-DD" → unix-время начала/конца этого дня в часовом поясе устройства. */
function dayBoundary(value: string, endOfDay: boolean): number | null {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = endOfDay
    ? new Date(year, month - 1, day, 23, 59, 59)
    : new Date(year, month - 1, day, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
}

export async function fetchArchivePage(
  filters: ArchiveFilters,
  beforeId?: number,
  limit = 30,
): Promise<ArchivePage> {
  const params = new URLSearchParams();
  if (beforeId !== undefined) params.set('before_id', String(beforeId));
  params.set('limit', String(limit));
  if (filters.event) params.set('event', filters.event);
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.chatId !== null) params.set('chat_id', String(filters.chatId));
  const from =
    filters.fromTs ??
    (filters.dateFrom ? dayBoundary(filters.dateFrom, false) : null);
  const to =
    filters.toTs ?? (filters.dateTo ? dayBoundary(filters.dateTo, true) : null);
  if (from !== null) params.set('date_from', String(from));
  if (to !== null) params.set('date_to', String(to));
  params.set('sort', filters.sort);
  return apiGet<ArchivePage>(`/api/archive?${params.toString()}`);
}

export async function fetchArchivePrefs(): Promise<ArchivePrefsResponse> {
  return apiGet<ArchivePrefsResponse>('/api/archive/settings');
}

/** Сохраняет только изменённые настройки; в ответе — полные актуальные. */
export async function saveArchivePrefs(
  patch: Partial<ArchivePrefs>,
): Promise<ArchivePrefsResponse> {
  return apiPost<ArchivePrefsResponse>('/api/archive/settings', patch);
}

export const fetchArchiveRules = () =>
  apiGet<ArchiveRules>('/api/archive/rules');

export const saveArchiveRule = (chatId: number, body: ArchiveRuleBody) =>
  apiPut<ArchiveRules>(`/api/archive/rules/${chatId}`, body);

export function fetchUserbotDialogs(
  query: string,
  kind: DialogKind | null,
  offset: number,
  limit = 50,
): Promise<UserbotDialogs> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (query.trim()) params.set('q', query.trim());
  if (kind) params.set('kind', kind);
  return apiGet<UserbotDialogs>(`/api/userbot/dialogs?${params.toString()}`);
}

/** Удаляет записи архива (или только их файлы); чужие id сервер игнорирует. */
export const deleteArchiveEntries = (ids: number[], mediaOnly: boolean) =>
  apiDelete<ArchiveDeleteResult>('/api/archive', {
    ids,
    media_only: mediaOnly,
  });

export const fetchPlan = () => apiGet<Plan>('/api/plan');
