import { useState } from 'react';

import { ApiError } from '@/shared/api/client';

import { Section } from '@/shared/ui/Section';
import type { LocaleCode } from '@/shared/i18n';
import { LANGUAGE_NAMES, useLocale } from '@/shared/i18n';
import {
  useConnectMirror,
  useDisconnectMirror,
  useMirror,
  useSettings,
  useUpdatePrefix,
} from '@/features/settings/hooks/useSettings';
import type { MirrorStatus } from '@/features/settings/types';
import { ACCENT_SCHEMES } from '@/shared/lib/accents';
import { useThemeMode } from '@/shared/context/ThemeContext';

export function SettingsPage() {
  const { t } = useLocale();
  const settings = useSettings();
  const mirror = useMirror();

  if (settings.isPending || mirror.isPending) {
    return <div className="page__status">{t('settings.loading')}</div>;
  }
  if (settings.isError || mirror.isError) {
    return (
      <div className="page__status page__status--error">
        {t('settings.error')}
      </div>
    );
  }
  return <SettingsContent mirror={mirror.data} prefix={settings.data.prefix} />;
}

function SettingsContent({
  prefix,
  mirror,
}: {
  prefix: string;
  mirror: MirrorStatus;
}) {
  const { t, locale, setLocale } = useLocale();
  const [prefixInput, setPrefixInput] = useState(prefix);
  const [prefixError, setPrefixError] = useState<string | null>(null);
  const [mirrorToken, setMirrorToken] = useState('');
  const [mirrorError, setMirrorError] = useState<string | null>(null);
  const { accent, setAccent } = useThemeMode();

  const updatePrefix = useUpdatePrefix();
  const connectMirror = useConnectMirror();
  const disconnectMirror = useDisconnectMirror();
  const savingPrefix = updatePrefix.isPending;
  const connectingMirror = connectMirror.isPending;

  async function savePrefix() {
    if (prefixInput.length !== 1) {
      setPrefixError(t('settings.prefixError'));
      return;
    }
    setPrefixError(null);
    try {
      await updatePrefix.mutateAsync(prefixInput);
    } catch {
      setPrefixError(t('settings.prefixSaveError'));
    }
  }

  async function handleMirrorConnect() {
    if (!mirrorToken.trim()) return;
    setMirrorError(null);
    try {
      await connectMirror.mutateAsync(mirrorToken.trim());
      setMirrorToken('');
    } catch (error) {
      // 503 start_failed: токен верный, но вебхук зеркала не поднялся
      const startFailed =
        error instanceof ApiError &&
        error.status === 503 &&
        error.detail === 'start_failed';
      setMirrorError(
        t(
          startFailed
            ? 'settings.mirrorStartFailed'
            : 'settings.mirrorConnectFailed',
        ),
      );
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t('settings.title')}</h1>
      </header>

      <Section title={t('settings.languageSection')}>
        <div className="language-switch">
          {(Object.keys(LANGUAGE_NAMES) as LocaleCode[]).map((code) => (
            <button
              className={`language-switch__item ${locale === code ? 'language-switch__item--active' : ''}`}
              key={code}
              onClick={() => setLocale(code)}
              type="button"
            >
              {LANGUAGE_NAMES[code]}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t('settings.colorSchemeSection')}>
        <div className="color-scheme-row">
          {ACCENT_SCHEMES.map((option) => (
            <button
              aria-label={option.id}
              className={`color-swatch ${accent === option.id ? 'color-swatch--active' : ''}`}
              key={option.id}
              onClick={() => void setAccent(option.id)}
              style={{ background: option.light }}
              type="button"
            />
          ))}
        </div>
      </Section>

      <Section title={t('settings.prefixSection')}>
        <div className="prefix-editor">
          <input
            className="prefix-editor__input"
            maxLength={1}
            onChange={(e) => setPrefixInput(e.target.value)}
            value={prefixInput}
          />
          <button
            className="prefix-editor__save"
            disabled={savingPrefix || prefixInput === prefix}
            onClick={savePrefix}
            type="button"
          >
            {savingPrefix ? t('settings.saving') : t('settings.save')}
          </button>
        </div>
        {prefixError && <p className="prefix-editor__error">{prefixError}</p>}
        <p className="section__hint">{t('settings.prefixHint', { prefix })}</p>
      </Section>

      <Section title={t('settings.mirrorSection')}>
        {mirror.connected ? (
          <>
            <div className="info-row">
              <span className="info-row__label">
                {t('settings.mirrorConnected')}
              </span>
              <span className="info-row__value">@{mirror.username}</span>
            </div>
            {!mirror.running && (
              <p className="prefix-editor__error">
                {t('settings.mirrorNotRunning')}
              </p>
            )}
            <button
              className="prefix-editor__save"
              onClick={() => disconnectMirror.mutate()}
              type="button"
            >
              {t('settings.mirrorDisconnect')}
            </button>
          </>
        ) : (
          <>
            <p className="section__hint">{t('settings.mirrorOnboarding')}</p>
            <div className="prefix-editor">
              <input
                className="prefix-editor__input"
                style={{ width: 'auto', flex: 1 }}
                onChange={(e) => setMirrorToken(e.target.value)}
                placeholder="123456:AAAA...xyz"
                value={mirrorToken}
              />
              <button
                className="prefix-editor__save"
                disabled={connectingMirror || !mirrorToken.trim()}
                onClick={handleMirrorConnect}
                type="button"
              >
                {connectingMirror
                  ? t('settings.mirrorConnecting')
                  : t('settings.mirrorConnect')}
              </button>
            </div>
            {mirrorError && (
              <p className="prefix-editor__error">{mirrorError}</p>
            )}
          </>
        )}
      </Section>
    </div>
  );
}
