import { useChats } from '@/features/chats/hooks/useChats';
import { LinkscanChatRow } from '@/features/linkscan/components/LinkscanChatRow';
import {
  useLinkscan,
  useUpdateLinkscan,
} from '@/features/linkscan/hooks/useLinkscan';
import { PROVIDER_NAMES } from '@/features/linkscan/types';
import { useLocale } from '@/shared/i18n';
import { Section } from '@/shared/ui/Section';
import { Switch } from '@/shared/ui/Switch';

const CARD =
  'divide-line border-line bg-card divide-y overflow-hidden rounded-2xl border';
const ROW = 'flex items-center justify-between gap-3 px-4 py-3';

export function LinkscanPage() {
  const { t } = useLocale();
  const state = useLinkscan();
  const update = useUpdateLinkscan();
  const chats = useChats();

  if (state.isPending) {
    return <div className="page__status">{t('linkscan.loading')}</div>;
  }
  if (state.isError) {
    return (
      <div className="page__status page__status--error">
        {t('linkscan.error')}
      </div>
    );
  }

  const { enabled, scope, external, providers } = state.data;
  const selected = new Set(state.data.chats);
  const configured = Object.entries(providers);
  const anyConfigured = configured.some(([, on]) => on);

  function toggleChat(chatId: number, on: boolean) {
    const next = new Set(selected);
    if (on) next.add(chatId);
    else next.delete(chatId);
    update.mutate({ chats: [...next] });
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t('linkscan.title')}</h1>
      </header>

      <p className="section__hint mb-3">{t('linkscan.intro')}</p>

      <div className={`${CARD} mb-4`}>
        <div className={ROW}>
          <span className="text-fg">{t('linkscan.enable')}</span>
          <Switch
            checked={enabled}
            onChange={(on) => update.mutate({ enabled: on })}
          />
        </div>
      </div>
      <p className="section__hint mb-4">{t('linkscan.enableHint')}</p>

      {update.isError && (
        <p className="prefix-editor__error">{t('linkscan.saveError')}</p>
      )}

      {enabled && (
        <>
          <Section title={t('linkscan.externalSection')}>
            <div className={CARD}>
              <div className={ROW}>
                <span className="text-fg">{t('linkscan.external')}</span>
                <Switch
                  checked={external}
                  onChange={(on) => update.mutate({ external: on })}
                />
              </div>
            </div>
            <p className="section__hint">{t('linkscan.externalHint')}</p>
            {external && (
              <>
                <div className={`${CARD} mt-3`}>
                  {configured.map(([id, on]) => (
                    <div className={ROW} key={id}>
                      <span className="text-fg">
                        {PROVIDER_NAMES[id] ?? id}
                      </span>
                      <span
                        className={
                          on ? 'text-accent text-sm' : 'text-hint text-sm'
                        }
                      >
                        {on
                          ? t('linkscan.providerOn')
                          : t('linkscan.providerOff')}
                      </span>
                    </div>
                  ))}
                </div>
                {!anyConfigured && (
                  <p className="section__hint">{t('linkscan.noProviders')}</p>
                )}
              </>
            )}
          </Section>

          <Section title={t('linkscan.chatsSection')}>
            <div className="language-switch">
              {(['all', 'selected'] as const).map((value) => (
                <button
                  className={`language-switch__item ${scope === value ? 'language-switch__item--active' : ''}`}
                  key={value}
                  onClick={() => update.mutate({ scope: value })}
                  type="button"
                >
                  {t(
                    value === 'all'
                      ? 'linkscan.scopeAll'
                      : 'linkscan.scopeSelected',
                  )}
                </button>
              ))}
            </div>

            {scope === 'selected' && (
              <>
                <p className="section__hint">{t('linkscan.chatsHint')}</p>
                {chats.isPending && (
                  <div className="page__status">{t('linkscan.loading')}</div>
                )}
                {chats.isSuccess && chats.data.length === 0 && (
                  <div className="page__status">{t('chats.empty')}</div>
                )}
                {chats.isSuccess && chats.data.length > 0 && (
                  <div className={CARD}>
                    {chats.data.map((chat) => (
                      <LinkscanChatRow
                        chatId={chat.chat_id}
                        key={chat.chat_id}
                        onChange={toggleChat}
                        selected={selected.has(chat.chat_id)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </Section>

          <p className="section__hint">{t('linkscan.filesHint')}</p>
        </>
      )}
    </div>
  );
}
