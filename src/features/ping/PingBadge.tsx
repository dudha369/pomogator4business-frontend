import { useState } from 'react';

import { useLocale } from '@/i18n';
import { fetchDeepPing, type DeepPing } from './api';
import { usePing } from './usePing';

function dotClass(ms: number | null, loading: boolean): string {
  if (loading) return 'bg-hint';
  if (ms === null) return 'bg-red-500';
  if (ms < 150) return 'bg-green-500';
  if (ms < 400) return 'bg-amber-500';
  return 'bg-red-500';
}

export function PingBadge() {
  const { t } = useLocale();
  const ping = usePing();
  const [open, setOpen] = useState(false);
  const [deep, setDeep] = useState<DeepPing | 'error' | null>(null);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) {
      setDeep(null);
      fetchDeepPing()
        .then(setDeep)
        .catch(() => setDeep('error'));
    }
  }

  function ms(value: number | null): string {
    return value === null ? t('ping.failed') : `${value} ms`;
  }

  function uptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return [
      d ? t('ping.unitD', { n: d }) : '',
      d || h ? t('ping.unitH', { n: h }) : '',
      t('ping.unitM', { n: m }),
    ]
      .filter(Boolean)
      .join(' ');
  }

  const loading = ping.status === 'loading';
  const value = ping.status === 'ok' ? ping.ms : null;

  return (
    <div className="relative">
      <button
        className="border-line bg-card text-fg flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm active:opacity-70"
        onClick={toggle}
        type="button"
      >
        <span className={`size-2.5 rounded-full ${dotClass(value, loading)}`} />
        {loading
          ? '…'
          : ping.status === 'offline'
            ? t('ping.offline')
            : `${ping.ms} ms`}
      </button>

      {open && (
        <div className="border-line bg-card absolute top-full right-0 z-10 mt-2 w-60 rounded-2xl border p-3 text-sm shadow-lg">
          {deep === null && <p className="text-hint">{t('ping.checking')}</p>}
          {deep === 'error' && (
            <p className="text-red-500">{t('ping.failed')}</p>
          )}
          {deep !== null && deep !== 'error' && (
            <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5">
              <dt className="text-hint">{t('ping.telegram')}</dt>
              <dd className="text-fg">{ms(deep.telegram_ms)}</dd>
              <dt className="text-hint">{t('ping.db')}</dt>
              <dd className="text-fg">{ms(deep.db_ms)}</dd>
              <dt className="text-hint">{t('ping.uptime')}</dt>
              <dd className="text-fg">{uptime(deep.uptime_seconds)}</dd>
            </dl>
          )}
        </div>
      )}
    </div>
  );
}
