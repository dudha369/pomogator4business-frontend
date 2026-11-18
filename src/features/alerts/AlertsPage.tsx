import { alertText } from '@/features/alerts/alertText';
import { AlertCard } from '@/features/alerts/components/AlertCard';
import {
  useAlerts,
  useDismissAlert,
  useMuteAlert,
  useUnmuteAlert,
} from '@/features/alerts/hooks/useAlerts';
import { useLocale } from '@/shared/i18n';
import { Section } from '@/shared/ui/Section';

export function AlertsPage() {
  const { t } = useLocale();
  const { data, isPending, isError } = useAlerts();
  const dismiss = useDismissAlert();
  const mute = useMuteAlert();
  const unmute = useUnmuteAlert();
  const busy = dismiss.isPending || mute.isPending || unmute.isPending;

  if (isPending) {
    return <div className="page__status">{t('alerts.loading')}</div>;
  }
  if (isError) {
    return (
      <div className="page__status page__status--error">
        {t('alerts.error')}
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t('alerts.title')}</h1>
      </header>

      {data.alerts.length === 0 ? (
        <p className="text-fg/60 mb-4 text-sm">{t('alerts.empty')}</p>
      ) : (
        data.alerts.map((alert) => (
          <AlertCard
            alert={alert}
            busy={busy}
            key={alert.id}
            onDismiss={dismiss.mutate}
            onMute={mute.mutate}
          />
        ))
      )}

      {data.muted.length > 0 && (
        <Section title={t('alerts.mutedTitle')}>
          <p className="text-fg/60 mb-2 text-sm">{t('alerts.mutedHint')}</p>
          {data.muted.map((code) => (
            <div
              className="border-line bg-card mb-2 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3"
              key={code}
            >
              <span className="text-fg min-w-0 text-sm">
                {alertText(code, {}, t).title}
              </span>
              <button
                className="text-accent shrink-0 text-sm active:opacity-70 disabled:opacity-50"
                disabled={busy}
                onClick={() => unmute.mutate(code)}
                type="button"
              >
                {t('alerts.unmute')}
              </button>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
