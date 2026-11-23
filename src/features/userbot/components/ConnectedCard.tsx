import { useState } from 'react';

import { BUTTON, CARD } from '@/features/userbot/components/LoginSteps';
import { useLocale } from '@/shared/i18n';

interface Props {
  status: 'connected' | 'connecting' | 'removing';
  username: string | null;
  busy: boolean;
  onDisconnect: () => void;
}

export function ConnectedCard({ status, username, busy, onDisconnect }: Props) {
  const { t } = useLocale();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={CARD}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-fg font-medium">
          {username ? `@${username}` : t('userbot.title')}
        </span>
        <span
          className={
            status === 'connected' ? 'text-accent text-sm' : 'text-hint text-sm'
          }
        >
          {t(`userbot.status.${status}`)}
        </span>
      </div>
      <p className="text-hint mb-4 text-sm">{t('userbot.connectedHint')}</p>

      {status !== 'removing' &&
        (confirming ? (
          <>
            <p className="text-fg mb-3 text-sm">
              {t('userbot.disconnectConfirm')}
            </p>
            <div className="flex gap-2">
              <button
                className="border-line text-fg flex-1 rounded-2xl border px-4 py-3 active:opacity-70"
                onClick={() => setConfirming(false)}
                type="button"
              >
                {t('userbot.cancel')}
              </button>
              <button
                className="bg-destructive text-on-accent flex-1 rounded-2xl px-4 py-3 font-medium active:opacity-70 disabled:opacity-50"
                disabled={busy}
                onClick={onDisconnect}
                type="button"
              >
                {t('userbot.disconnectYes')}
              </button>
            </div>
          </>
        ) : (
          <button
            className={`${BUTTON} !text-destructive border-line border !bg-transparent`}
            onClick={() => setConfirming(true)}
            type="button"
          >
            {t('userbot.disconnect')}
          </button>
        ))}
    </div>
  );
}
