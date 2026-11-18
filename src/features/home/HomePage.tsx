import { Link } from 'react-router-dom';

import { ROUTES } from '@/shared/constants/routes';
import { useLocale } from '@/shared/i18n';
import { useHome } from '@/features/home/hooks/useHome';
import { HomeCounters } from '@/features/home/components/HomeCounters';
import { HomeQuickToggles } from '@/features/home/components/HomeQuickToggles';
import { RecentActivityItem } from '@/features/home/components/RecentActivityItem';
import { PingBadge } from '@/features/ping/PingBadge';

export function HomePage() {
  const { t } = useLocale();
  const { data: summary, isPending, isError } = useHome();

  if (isPending) {
    return <div className="page__status">{t('home.loading')}</div>;
  }
  if (isError) {
    return (
      <div className="page__status page__status--error">{t('home.error')}</div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t('home.title')}</h1>
        <PingBadge />
      </header>

      <div
        className={`home-hero ${summary.connected ? 'home-hero--connected' : 'home-hero--disconnected'}`}
      >
        <div className="home-hero__status-dot" />
        <div className="home-hero__text">
          <p className="home-hero__status-label">
            {summary.connected ? t('home.connected') : t('home.notConnected')}
          </p>
          {summary.connected && summary.owner_name && (
            <p className="home-hero__owner">
              {summary.owner_name}
              {summary.owner_username && ` (@${summary.owner_username})`}
            </p>
          )}
          {!summary.connected && (
            <p className="home-hero__hint">{t('home.notConnectedHint')}</p>
          )}
        </div>
      </div>

      {summary.stats && <HomeCounters stats={summary.stats} />}

      <Link
        className="border-line bg-card text-fg mb-4 flex items-center justify-between rounded-2xl border px-4 py-3 active:opacity-70"
        to="/chats"
      >
        <span>{t('home.chatsLink')}</span>
        <span className="text-accent text-sm">→</span>
      </Link>

      <Link
        className="border-line bg-card text-fg mb-4 flex items-center justify-between rounded-2xl border px-4 py-3 active:opacity-70"
        to={ROUTES.alerts}
      >
        <span>{t('alerts.link')}</span>
        {summary.alerts_active > 0 ? (
          <span className="text-accent text-sm font-medium">
            ⚠️ {summary.alerts_active}
          </span>
        ) : (
          <span className="text-accent text-sm">→</span>
        )}
      </Link>

      <HomeQuickToggles
        emojiStatusEnabled={summary.emoji_status_enabled}
        emojiStatusGranted={summary.emoji_status_granted}
        mirrorConnected={summary.mirror_connected}
      />

      <div className="home-stats">
        <div className="home-stat">
          <span className="home-stat__value">
            {summary.modules_enabled}/{summary.modules_total}
          </span>
          <span className="home-stat__label">{t('home.modulesEnabled')}</span>
        </div>
        <div className="home-stat">
          <span className="home-stat__value">{summary.commands_total}</span>
          <span className="home-stat__label">{t('home.commandsTotal')}</span>
        </div>
        <div className="home-stat">
          <span className="home-stat__value">
            {summary.mirror_connected ? '✓' : '—'}
          </span>
          <span className="home-stat__label">{t('home.mirror')}</span>
        </div>
        <div className="home-stat">
          <span className="home-stat__value">
            {summary.emoji_status_enabled ? '✓' : '—'}
          </span>
          <span className="home-stat__label">{t('home.emojiStatus')}</span>
        </div>
      </div>

      {summary.recent_archive.length > 0 && (
        <div className="recent-activity">
          <h2 className="recent-activity__title">{t('home.recentActivity')}</h2>
          {summary.recent_archive.map((entry) => (
            <RecentActivityItem entry={entry} key={entry.log_id} />
          ))}
          <Link className="recent-activity__view-all" to="/archive">
            {t('home.viewFullArchive')} →
          </Link>
        </div>
      )}
    </div>
  );
}
