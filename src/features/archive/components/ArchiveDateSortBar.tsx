import { useLocale } from '@/i18n';
import type { ArchiveFilters } from '../types';

interface Props {
  filters: ArchiveFilters;
  onChange: (filters: ArchiveFilters) => void;
}

const FIELD =
  'min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-2 text-sm text-fg outline-none focus:border-accent';

export function ArchiveDateSortBar({ filters, onChange }: Props) {
  const { t } = useLocale();
  const hasDates = filters.dateFrom !== '' || filters.dateTo !== '';

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-hint flex min-w-0 flex-1 flex-col gap-1 text-xs">
          {t('archive.dateFrom')}
          <input
            className={FIELD}
            max={filters.dateTo || undefined}
            onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            type="date"
            value={filters.dateFrom}
          />
        </label>
        <label className="text-hint flex min-w-0 flex-1 flex-col gap-1 text-xs">
          {t('archive.dateTo')}
          <input
            className={FIELD}
            min={filters.dateFrom || undefined}
            onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            type="date"
            value={filters.dateTo}
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          className="border-line bg-card text-fg rounded-full border px-3 py-1.5 text-sm active:opacity-70"
          onClick={() =>
            onChange({
              ...filters,
              sort: filters.sort === 'desc' ? 'asc' : 'desc',
            })
          }
          type="button"
        >
          {filters.sort === 'desc' ? '↓ ' : '↑ '}
          {filters.sort === 'desc'
            ? t('archive.sortNewest')
            : t('archive.sortOldest')}
        </button>

        {hasDates && (
          <button
            className="text-accent px-2 py-1.5 text-sm active:opacity-70"
            onClick={() => onChange({ ...filters, dateFrom: '', dateTo: '' })}
            type="button"
          >
            {t('archive.clearDates')}
          </button>
        )}
      </div>
    </div>
  );
}
