import { ConnectedCard } from '@/features/userbot/components/ConnectedCard';
import {
  ConsentCard,
  ErrorLine,
  PasswordCard,
  QrCard,
} from '@/features/userbot/components/LoginSteps';
import {
  useDisconnectUserbot,
  useStartUserbotLogin,
  useSubmitUserbotPassword,
  useUserbot,
} from '@/features/userbot/hooks/useUserbot';
import { useLocale } from '@/shared/i18n';

export function UserbotPage() {
  const { t } = useLocale();
  const state = useUserbot();
  const start = useStartUserbotLogin();
  const submitPassword = useSubmitUserbotPassword();
  const disconnect = useDisconnectUserbot();

  if (state.isPending) {
    return <div className="page__status">{t('userbot.loading')}</div>;
  }
  if (state.isError) {
    return (
      <div className="page__status page__status--error">
        {t('userbot.error')}
      </div>
    );
  }

  const { reason, status, username, login } = state.data;
  const actionFailed =
    start.isError || submitPassword.isError || disconnect.isError;

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t('userbot.title')}</h1>
      </header>
      <p className="section__hint mb-3">{t('userbot.intro')}</p>

      {reason && (
        <p className="text-destructive mb-3 text-sm">
          {t(`userbot.unavailable.${reason}`)}
        </p>
      )}

      {!reason && (status === 'none' || status === 'revoked') && (
        <>
          {status === 'revoked' && (
            <p className="text-destructive mb-3 text-sm">
              {t('userbot.status.revoked')}
            </p>
          )}
          <ConsentCard
            busy={start.isPending}
            error={login?.state === 'error' ? login.error : null}
            onAccept={() => start.mutate()}
          />
        </>
      )}

      {status === 'login' && login?.state === 'password' && (
        <PasswordCard
          busy={submitPassword.isPending}
          error={login.error}
          onSubmit={(password) => submitPassword.mutate(password)}
        />
      )}
      {status === 'login' && login && login.state !== 'password' && (
        <QrCard login={login} />
      )}

      {(status === 'connected' ||
        status === 'connecting' ||
        status === 'removing') && (
        <ConnectedCard
          busy={disconnect.isPending}
          onDisconnect={() => disconnect.mutate()}
          status={status}
          username={username}
        />
      )}

      {actionFailed && <ErrorLine code="failed" />}
    </div>
  );
}
