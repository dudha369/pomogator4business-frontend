import { Check } from 'lucide-react';

import { useLocale } from '@/shared/i18n';
import { formatRelativeTime } from '@/shared/utils/relativeTime';
import { useChatInfo } from '@/features/archive/hooks/useChatInfo';
import { EVENT_ICONS, KindIcon } from '@/features/archive/kindIcons';
import type { ArchiveEntry } from '@/features/archive/types';
import { ArchiveAvatar } from '@/features/archive/components/ArchiveAvatar';

interface Props {
  /** одна запись или все сообщения удалённого альбома */
  entries: ArchiveEntry[];
  onOpen: () => void;
  /** режим выбора: нажатие отмечает запись, вместо чекбокса не открывает её */
  selectable?: boolean;
  checked?: boolean;
}

export function ArchiveEntryCard({
  entries,
  onOpen,
  selectable = false,
  checked = false,
}: Props) {
  const { t, locale } = useLocale();
  const entry = entries[0];
  // чаты юзербота бот не видит: название берём из самой записи
  const fromUserbot =
    entry.source === 'userbot' && entry.chat_kind !== 'private';
  const info = useChatInfo(fromUserbot ? null : entry.chat_id);
  const isDeleted = entry.event === 'deleted';
  const displayName =
    (fromUserbot ? entry.chat_title : info?.full_name) ||
    t('archive.unknownSender');
  const content = isDeleted ? entry.old : entry.new;
  const kind = content?.kind ?? entry.media_type ?? 'text';
  const text =
    entries.map((e) => (isDeleted ? e.old_text : e.new_text)).find(Boolean) ||
    '';
  const EventIcon = isDeleted ? EVENT_ICONS.deleted : EVENT_ICONS.edited;

  return (
    <button
      aria-pressed={selectable ? checked : undefined}
      className="archive-entry"
      onClick={onOpen}
      type="button"
    >
      {selectable && (
        <span
          aria-hidden
          className={`flex size-5 shrink-0 items-center justify-center self-center rounded-md border ${checked ? 'border-accent bg-accent text-white' : 'border-line'}`}
        >
          {checked && <Check className="size-3.5" />}
        </span>
      )}
      <ArchiveAvatar
        fallbackLabel={displayName}
        userId={fromUserbot ? null : entry.chat_id}
      />
      <div className="archive-entry__body">
        <div className="archive-entry__header">
          <span className="archive-entry__name">{displayName}</span>
          {info?.username && (
            <span className="archive-entry__username">@{info.username}</span>
          )}
          <span className="text-hint shrink-0 text-xs">
            {entry.is_owner
              ? t('archive.authorOwn')
              : fromUserbot && entry.sender_name
                ? entry.sender_name
                : t('archive.authorPeer')}
          </span>
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
