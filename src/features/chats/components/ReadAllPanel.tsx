import { useMemo, useState } from 'react';

import { useLocale } from '@/shared/i18n';
import { Switch } from '@/shared/ui/Switch';
import {
  useReadAllPreview,
  useReadAllRun,
  useReadAllStatus,
} from '@/features/chats/hooks/useReadAll';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import type {
  ReadAllRequest,
  ReadAllResult,
  ReadMode,
  ReadUnit,
} from '@/features/chats/types';

const MODES: ReadMode[] = ['all', 'last', 'older'];

const FIELD =
  'w-20 rounded-xl border border-line bg-page px-3 py-2 text-fg outline-none focus:border-accent';

function buildRequest(
  mode: ReadMode,
  amount: number,
  unit: ReadUnit,
  excludeFavorites: boolean,
): ReadAllRequest {
  const hours = Math.max(1, Math.floor(amount)) * (unit === 'd' ? 24 : 1);
  return {
    last_hours: mode === 'last' ? hours : undefined,
    older_hours: mode === 'older' ? hours : undefined,
    exclude_favorites: excludeFavorites,
  };
}

export function ReadAllPanel() {
  const { t } = useLocale();
  const [mode, setMode] = useState<ReadMode>('all');
  const [amount, setAmount] = useState(6);
  const [unit, setUnit] = useState<ReadUnit>('h');
  const [excludeFavorites, setExcludeFavorites] = useState(false);
  const [followed, setFollowed] = useState(false);

  const status = useReadAllStatus();
  const run = useReadAllRun();

  // вернулись на страницу, пока задача идёт, — подхватываем прогресс
  if (status.data?.running && !followed) setFollowed(true);

  const pollFailed = status.isError;
  const running =
    run.isPending || (status.data?.running === true && !pollFailed);
  const progress = running && status.data?.running ? status.data : null;
  const result: ReadAllResult | 'error' | null =
    !followed || running
      ? null
      : run.isError || pollFailed
        ? 'error'
        : (status.data ?? null);

  const amountValid =
    mode === 'all' || (Number.isFinite(amount) && amount >= 1);

  const request = useMemo(
    () => buildRequest(mode, amount, unit, excludeFavorites),
    [mode, amount, unit, excludeFavorites],
  );
  const debouncedRequest = useDebouncedValue(request, 300);
  const preview = useReadAllPreview(amountValid ? debouncedRequest : null);
  const matched = amountValid ? (preview.data?.matched ?? null) : null;

  function start() {
    setFollowed(true);
    run.mutate(request);
  }

  function resultText(): string | null {
    if (result === null) return null;
    if (result === 'error' || (result.matched > 0 && result.done === 0)) {
      return t('chats.resultFail');
    }
    if (result.matched === 0) return t('chats.resultNothing');
    if (result.failed > 0) {
      return t('chats.resultPartial', {
        done: result.done,
        total: result.matched,
      });
    }
    return t('chats.resultOk', { done: result.done });
  }

  const message = resultText();

  return (
    <section className="border-line bg-card mb-5 rounded-2xl border p-4">
      <h2 className="text-fg mb-3 text-base font-semibold">
        {t('chats.readTitle')}
      </h2>

      <div className="mb-3 flex gap-2">
        {MODES.map((m) => (
          <button
            className={`flex-1 rounded-full border px-3 py-1.5 text-sm ${
              mode === m
                ? 'border-accent bg-accent text-white'
                : 'border-line text-fg'
            }`}
            key={m}
            onClick={() => setMode(m)}
            type="button"
          >
            {t(`chats.mode.${m}`)}
          </button>
        ))}
      </div>

      {mode !== 'all' && (
        <div className="mb-3 flex items-center gap-2">
          <input
            className={FIELD}
            inputMode="numeric"
            min={1}
            onChange={(e) => setAmount(Number(e.target.value))}
            type="number"
            value={Number.isFinite(amount) ? amount : ''}
          />
          <select
            className="border-line bg-page text-fg focus:border-accent rounded-xl border px-3 py-2 outline-none"
            onChange={(e) => setUnit(e.target.value as ReadUnit)}
            value={unit}
          >
            <option value="h">{t('chats.unitHours')}</option>
            <option value="d">{t('chats.unitDays')}</option>
          </select>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-fg">{t('chats.excludeFavorites')}</span>
        <Switch checked={excludeFavorites} onChange={setExcludeFavorites} />
      </div>

      <p className="text-hint mb-3 text-sm">
        {matched === null ? '…' : t('chats.matched', { count: matched })}
      </p>

      <button
        className="bg-accent w-full rounded-xl px-4 py-3 font-medium text-white disabled:opacity-40"
        disabled={running || !amountValid || matched === 0}
        onClick={start}
        type="button"
      >
        {running
          ? progress
            ? t('chats.progress', {
                done: progress.done + progress.failed,
                total: progress.matched,
              })
            : t('chats.reading')
          : t('chats.readButton')}
      </button>

      {message && <p className="text-fg mt-3 text-sm">{message}</p>}
      <p className="text-hint mt-3 text-xs">{t('chats.hint')}</p>
    </section>
  );
}
