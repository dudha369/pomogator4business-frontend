import { useLocale } from '@/i18n';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';
import { useChatInfo } from '../hooks/useChatInfo';
import type { ArchiveEntry } from '../types';
import { ArchiveAvatar } from './ArchiveAvatar';
import { ArchiveContentView, contentOf } from './ArchiveContentView';

interface Props {
  /** выбранная запись; у удалённого альбома — все его сообщения */
  entries: ArchiveEntry[] | null;
  onClose: () => void;
}

export function ArchiveEntryModal({ entries, onClose }: Props) {
  const entry = entries?.[0] ?? null;
  const { t, locale } = useLocale();
  const info = useChatInfo(entry?.chat_id ?? null);
  const displayName = info?.full_name || t('archive.unknownSender');
  const isDeleted = entry?.event === 'deleted';

  return (
    <BottomSheet open={entry !== null} onClose={onClose}>
      {entry && (
        <div className="archive-modal">
          <div className="archive-modal__header">
            <ArchiveAvatar fallbackLabel={displayName} userId={entry.chat_id} />
            <div>
              <h2 className="archive-modal__name">{displayName}</h2>
              {info?.username && (
                <span className="archive-modal__username">
                  @{info.username}
                </span>
              )}
            </div>
          </div>

          <p className="archive-modal__event">
            {isDeleted ? t('archive.eventDeleted') : t('archive.eventEdited')} ·{' '}
            {new Date(entry.created_at * 1000).toLocaleString(locale)}
          </p>

          {isDeleted ? (
            <div className="space-y-3">
              {entries!.map((item, index) => (
                <ArchiveContentView
                  content={contentOf(item, 'old')}
                  entry={item}
                  hideForward={index > 0}
                  key={item.log_id}
                  logId={item.log_id}
                  which="old"
                />
              ))}
            </div>
          ) : (
            <>
              <h3 className="command-modal__section-title">
                {t('archive.before')}
              </h3>
              <div className="opacity-80">
                <ArchiveContentView
                  content={contentOf(entry, 'old')}
                  entry={entry}
                  logId={entry.log_id}
                  which="old"
                />
              </div>
              <h3 className="command-modal__section-title">
                {t('archive.after')}
              </h3>
              <ArchiveContentView
                content={contentOf(entry, 'new')}
                entry={entry}
                logId={entry.log_id}
                which="new"
              />
            </>
          )}
        </div>
      )}
    </BottomSheet>
  );
}