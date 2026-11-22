import { alertText } from '@/features/alerts/alertText';
import type { AlertItem } from '@/features/alerts/types';
import { useLocale } from '@/shared/i18n';

interface Props {
  alert: AlertItem;
  busy: boolean;
  onDismiss: (id: number) => void;
  onMute: (id: number) => void;
}

const BUTTON = 'text-accent text-sm active:opacity-70 disabled:opacity-50';

export function AlertCard({ alert, busy, onDismiss, onMute }: Props) {
  const { t, locale } = useLocale();
  const { title, text } = alertText(alert.code, alert.details, t);
  const time = new Date(alert.last_at * 1000).toLocaleString(locale);

  return (
    <div className="border-line bg-card mb-3 rounded-2xl border px-4 py-3">
      <p className="text-fg font-medium">⚠️ {title}</p>
      {text && (
        <p className="text-fg/80 mt-1 text-sm whitespace-pre-line">{text}</p>
      )}
      <p className="text-fg/60 mt-2 text-xs">
        {t('alerts.last', { time })}
        {alert.count > 1 && ` · ${t('alerts.count', { n: alert.count })}`}
      </p>
      <div className="mt-3 flex gap-4">
        <button
          className={BUTTON}
          disabled={busy}
          onClick={() => onDismiss(alert.id)}
          type="button"
        >
          {t('alerts.dismiss')}
        </button>
        <button
          className={BUTTON}
          disabled={busy}
          onClick={() => onMute(alert.id)}
          type="button"
        >
          {t('alerts.mute')}
        </button>
      </div>
    </div>
  );
}
