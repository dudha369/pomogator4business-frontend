import type { ArchiveEntry } from './types';

/** Одна карточка в списке: обычная запись или целый удалённый альбом. */
export interface ArchiveGroup {
  key: string;
  /** от старого сообщения к новому — как в самом альбоме */
  entries: ArchiveEntry[];
}

/** Склеивает подряд идущие удалённые сообщения одного альбома (media_group_id).
 * Бот пишет в архив каждое сообщение отдельно, но показываем их вместе —
 * так же, как бот присылает один Rich-альбом. */
export function groupAlbums(entries: ArchiveEntry[]): ArchiveGroup[] {
  const groups: ArchiveGroup[] = [];
  const byAlbum = new Map<string, ArchiveGroup>();
  for (const entry of entries) {
    const albumId =
      entry.event === 'deleted' ? entry.old?.media_group_id : null;
    if (!albumId) {
      groups.push({ key: String(entry.log_id), entries: [entry] });
      continue;
    }
    const key = `${entry.chat_id}:${albumId}`;
    const existing = byAlbum.get(key);
    if (existing) {
      existing.entries.push(entry);
    } else {
      const group = { key, entries: [entry] };
      byAlbum.set(key, group);
      groups.push(group);
    }
  }
  for (const group of groups) {
    group.entries.sort((a, b) => a.message_id - b.message_id);
  }
  return groups;
}