import { useLocale } from '@/i18n';
import type { HomeStats } from '../types';

interface Props {
  stats: HomeStats;
}

function Counter({
  label,
  total,
  incoming,
}: {
  label: string;
  total: number;
  incoming: number;
}) {
  const { t } = useLocale();
  return (
    <div className="border-line bg-card flex flex-1 flex-col gap-1 rounded-2xl border p-4">
      <span className="text-hint text-xs">{label}</span>
      <span className="text-fg text-3xl leading-none font-semibold">
        {total}
      </span>
      <span className="text-hint text-xs">
        {t('home.incomingCount', { count: incoming })}
      </span>
    </div>
  );
}

export function HomeCounters({ stats }: Props) {
  const { t } = useLocale();
  return (
    <div className="mb-4 flex gap-3">
      <Counter
        incoming={stats.todayIncoming}
        label={t('home.messagesToday')}
        total={stats.todayTotal}
      />
      <Counter
        incoming={stats.weekIncoming}
        label={t('home.messagesWeek')}
        total={stats.weekTotal}
      />
    </div>
  );
}
