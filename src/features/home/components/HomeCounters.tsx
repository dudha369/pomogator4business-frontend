import { useLocale } from "@/i18n";
import type { HomeStats } from "../types";

interface Props {
  stats: HomeStats;
}

function Counter({ label, total, incoming }: { label: string; total: number; incoming: number }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-1 flex-col gap-1 rounded-2xl border border-line bg-card p-4">
      <span className="text-xs text-hint">{label}</span>
      <span className="text-3xl font-semibold leading-none text-fg">{total}</span>
      <span className="text-xs text-hint">{t("home.incomingCount", { count: incoming })}</span>
    </div>
  );
}

export function HomeCounters({ stats }: Props) {
  const { t } = useLocale();
  return (
    <div className="mb-4 flex gap-3">
      <Counter incoming={stats.todayIncoming} label={t("home.messagesToday")} total={stats.todayTotal} />
      <Counter incoming={stats.weekIncoming} label={t("home.messagesWeek")} total={stats.weekTotal} />
    </div>
  );
}
