import { TriangleAlert } from 'lucide-react';

import { usePlan } from '@/features/archive/hooks/useArchive';
import { useLocale } from '@/shared/i18n';

const MB = 1024 * 1024;
/** С какой заполненности показываем плашку. */
const WARN_FROM = 0.8;

interface Meter {
  used: number;
  limit: number;
  share: number;
  label: string;
}

/** Плашка над лентой: сколько места занято и что делать, когда оно кончилось.
 * Для безлимитных тарифов и при заполнении ниже порога не показывается. */
export function ArchiveUsageBar() {
  const { t } = useLocale();
  const plan = usePlan().data;
  if (!plan) return null;

  const meters: Meter[] = [];
  for (const row of plan.limits) {
    if (row.limit === null || row.used === null || row.limit <= 0) continue;
    if (row.metric === 'archive_entries') {
      meters.push({
        used: row.used,
        limit: row.limit,
        share: row.used / row.limit,
        label: t('archive.usage.entries', {
          used: row.used,
          limit: row.limit,
        }),
      });
    } else if (row.metric === 'archive_media_bytes') {
      meters.push({
        used: row.used,
        limit: row.limit,
        share: row.used / row.limit,
        label: t('archive.usage.media', {
          used: Math.ceil(row.used / MB),
          limit: Math.round(row.limit / MB),
        }),
      });
    }
  }
  const shown = meters.filter((m) => m.share >= WARN_FROM);
  if (shown.length === 0) return null;
  const full = shown.some((m) => m.used >= m.limit);

  return (
    <div className="bg-card mb-3 rounded-xl p-3 text-sm">
      {shown.map((m) => (
        <div className="mb-2 last:mb-0" key={m.label}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-fg">{m.label}</span>
          </div>
          <div
            aria-hidden
            className="bg-secondary mt-1 h-1.5 overflow-hidden rounded-full"
          >
            <div
              className={`h-full ${m.used >= m.limit ? 'bg-destructive' : 'bg-accent'}`}
              style={{ width: `${Math.min(100, Math.round(m.share * 100))}%` }}
            />
          </div>
        </div>
      ))}
      {full && (
        <p className="text-destructive mt-2 flex items-start gap-1.5">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>{t('archive.usage.full')}</span>
        </p>
      )}
    </div>
  );
}
