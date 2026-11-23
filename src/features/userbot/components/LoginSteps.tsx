import { useState } from 'react';

import type { UserbotState } from '@/features/userbot/types';
import { useLocale } from '@/shared/i18n';
import type { TranslationKey } from '@/shared/i18n/dictionaries';

export const CARD = 'border-line bg-card mb-4 rounded-2xl border p-4';
export const BUTTON =
  'bg-accent text-on-accent w-full rounded-2xl px-4 py-3 font-medium active:opacity-70 disabled:opacity-50';

const LOGIN_ERRORS: Record<string, TranslationKey> = {
  invalid_password: 'userbot.error.invalid_password',
  too_many_attempts: 'userbot.error.too_many_attempts',
  expired: 'userbot.error.expired',
  flood: 'userbot.error.flood',
  storage: 'userbot.error.storage',
  failed: 'userbot.error.failed',
};

type Login = NonNullable<UserbotState['login']>;

export function ErrorLine({ code }: { code: string | null }) {
  const { t } = useLocale();
  if (!code) return null;
  return (
    <p className="text-destructive mb-3 text-sm">
      {t(LOGIN_ERRORS[code] ?? 'userbot.error.failed')}
    </p>
  );
}

const CONSENT_KEYS = [
  'userbot.consent1',
  'userbot.consent2',
  'userbot.consent3',
  'userbot.consent4',
] as const;

interface ConsentProps {
  busy: boolean;
  error: string | null;
  onAccept: () => void;
}

export function ConsentCard({ busy, error, onAccept }: ConsentProps) {
  const { t } = useLocale();
  return (
    <div className={CARD}>
      <h2 className="text-fg mb-2 font-medium">{t('userbot.consentTitle')}</h2>
      <ul className="text-hint mb-4 list-disc space-y-2 pl-5 text-sm">
        {CONSENT_KEYS.map((key) => (
          <li key={key}>{t(key)}</li>
        ))}
      </ul>
      <ErrorLine code={error} />
      <button
        className={BUTTON}
        disabled={busy}
        onClick={onAccept}
        type="button"
      >
        {error ? t('userbot.retry') : t('userbot.connect')}
      </button>
    </div>
  );
}

export function QrCard({ login }: { login: Login }) {
  const { t } = useLocale();
  if (login.state === 'starting' || !login.qr) {
    return <div className="page__status">{t('userbot.starting')}</div>;
  }
  return (
    <div className={`${CARD} text-center`}>
      <h2 className="text-fg mb-3 font-medium">{t('userbot.qrTitle')}</h2>
      <img
        alt={t('userbot.qrAlt')}
        className="mx-auto mb-3 w-64 max-w-full rounded-xl bg-white p-2"
        src={login.qr}
      />
      <p className="text-hint text-sm">{t('userbot.qrHint')}</p>
    </div>
  );
}

interface PasswordProps {
  busy: boolean;
  error: string | null;
  onSubmit: (password: string) => void;
}

export function PasswordCard({ busy, error, onSubmit }: PasswordProps) {
  const { t } = useLocale();
  const [password, setPassword] = useState('');

  function submit() {
    if (!password) return;
    onSubmit(password);
    setPassword(''); // пароль не остаётся в состоянии компонента
  }

  return (
    <div className={CARD}>
      <h2 className="text-fg mb-2 font-medium">{t('userbot.passwordTitle')}</h2>
      <p className="text-hint mb-3 text-sm">{t('userbot.passwordHint')}</p>
      <input
        autoComplete="current-password"
        className="border-line bg-page text-fg mb-3 w-full rounded-xl border px-3 py-2"
        onChange={(event) => setPassword(event.target.value)}
        placeholder={t('userbot.passwordPlaceholder')}
        type="password"
        value={password}
      />
      <ErrorLine code={error} />
      <button
        className={BUTTON}
        disabled={busy || !password}
        onClick={submit}
        type="button"
      >
        {t('userbot.passwordSubmit')}
      </button>
    </div>
  );
}
