import { useLocale } from '@/i18n';
import { formatRelativeTime } from '@/shared/utils/relativeTime';
import { useChatInfo } from '../hooks/useChatInfo';
import { EVENT_ICONS, KindIcon } from '../kindIcons';
import type { ArchiveEntry } from '../types';
import { ArchiveAvatar } from './ArchiveAvatar';

interface Props {
  /** одна запись или все сообщения удалённого альбома */
  entries: ArchiveEntry[];
  onOpen: () => void;
}

export function ArchiveEntryCard({ entries, onOpen }: Props) {
  const { t, locale } = useLocale();
  const entry = entries[0];
  const info = useChatInfo(entry.chat_id);
  const isDeleted = entry.event === 'deleted';
  const displayName = info?.full_name || t('archive.unknownSender');
  const content = isDeleted ? entry.old : entry.new;
  const kind = content?.kind ?? entry.media_type ?? 'text';
  const text =
    entries.map((e) => (isDeleted ? e.old_text : e.new_text)).find(Boolean) ||
    '';
  const EventIcon = isDeleted ? EVENT_ICONS.deleted : EVENT_ICONS.edited;

  return (
    <button className="archive-entry" onClick={onOpen} type="button">
      <ArchiveAvatar fallbackLabel={displayName} userId={entry.chat_id} />
      <div className="archive-entry__body">
        <div className="archive-entry__header">
          <span className="archive-entry__name">{displayName}</span>
          {info?.username && (
            <span className="archive-entry__username">@{info.username}</span>
          )}
          <span className="archive-entry__icon">
            <EventIcon className="size-4" />
          </span>
        </div>
        <p className="archive-entry__preview flex items-center gap-1.5">
          {kind !== 'text' && (
            <KindIcon className="size-4 shrink-0" kind={kind} />
          )}
          <span className="truncate">
            {text ||
              (kind === 'text'
                ? t('archive.mediaPlaceholder')
                : t(`archive.kind.${kind}`))}
          </span>
          {entries.length > 1 && (
            <span className="text-hint shrink-0">×{entries.length}</span>
          )}
        </p>
        <span className="archive-entry__time">
          {formatRelativeTime(entry.created_at, locale)}
        </span>
      </div>
    </button>
  );
}