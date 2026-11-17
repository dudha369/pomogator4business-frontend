import { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { useLocale } from '@/shared/i18n';
import { useArchiveList } from '@/features/archive/hooks/useArchive';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { ArchiveEntryCard } from '@/features/archive/components/ArchiveEntryCard';
import { ArchiveEntryModal } from '@/features/archive/components/ArchiveEntryModal';
import { ArchiveFiltersBar } from '@/features/archive/components/ArchiveFilters';
import { ArchiveSettingsSheet } from '@/features/archive/components/ArchiveSettingsSheet';
import { groupAlbums } from '@/features/archive/groupAlbums';
import type { ArchiveEntry, ArchiveFilters } from '@/features/archive/types';
import { DEFAULT_ARCHIVE_FILTERS } from '@/features/archive/types';

export function ArchivePage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ArchiveFilters>(() => {
    const chatId = searchParams.get('chat_id');
    return {
      ...DEFAULT_ARCHIVE_FILTERS,
      chatId: chatId ? Number(chatId) : null,
    };
  });
  const [selected, setSelected] = useState<ArchiveEntry[] | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // дебаунс 300 мс — чтобы не бить запросом на каждую букву в поиске
  const debouncedFilters = useDebouncedValue(filters, 300);
  const settled = debouncedFilters === filters;
  const list = useArchiveList(debouncedFilters);
  const entries = list.data ?? [];
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;
  // ошибка подгрузки следующей страницы список не заменяет — повторится при прокрутке
  const failed = list.isError && !list.data;
  const loading = list.isPending;
  const hasMore = settled && hasNextPage;

  // Автоподгрузка: невидимый сентинел внизу списка + IntersectionObserver
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (observed) => {
        if (observed[0]?.isIntersecting && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="page">
      <header className="page__header flex items-center justify-between">
        <h1>{t('archive.title')}</h1>
        <button
          aria-label={t('archive.settings.title')}
          className="text-hint p-2"
          onClick={() => setSettingsOpen(true)}
          type="button"
        >
          <SlidersHorizontal className="size-5" />
        </button>
      </header>
      <ArchiveSettingsSheet
        onClose={() => setSettingsOpen(false)}
        open={settingsOpen}
      />

      <ArchiveFiltersBar filters={filters} onChange={setFilters} />

      {loading && <div className="page__status">{t('archive.loading')}</div>}
      {failed && (
        <div className="page__status page__status--error">
          {t('archive.error')}
        </div>
      )}
      {!loading && !failed && entries.length === 0 && (
        <div className="page__status">{t('archive.empty')}</div>
      )}

      {!loading && !failed && entries.length > 0 && (
        <div className="archive-list">
          {groupAlbums(entries).map((group) => (
            <ArchiveEntryCard
              entries={group.entries}
              key={group.key}
              onOpen={() => setSelected(group.entries)}
            />
          ))}
          {hasMore && <div className="archive-sentinel" ref={sentinelRef} />}
          {isFetchingNextPage && (
            <div className="page__status">{t('archive.loadingMore')}</div>
          )}
        </div>
      )}

      <ArchiveEntryModal entries={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
