import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  DialogRow,
  PrivateChatRow,
} from '@/features/archive/components/ArchiveChatRows';
import {
  ruleFor,
  useArchiveRules,
  useSaveArchiveRule,
  useUserbotDialogs,
} from '@/features/archive/hooks/useArchiveRules';
import type { DialogKind } from '@/features/archive/types';
import { useChats } from '@/features/chats/hooks/useChats';
import { ApiError } from '@/shared/api/client';
import { ROUTES } from '@/shared/constants/routes';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useLocale } from '@/shared/i18n';

const CARD =
  'divide-line border-line bg-card divide-y overflow-hidden rounded-2xl border';

type Tab = 'private' | 'groups';

/** Какие чаты попадают в архив. Личные ведёт бизнес-бот (включены по умолчанию),
 * группы и каналы — юзербот (выключены, пока вы не включите). */
export function ArchiveChatsPage() {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>('private');
  const [search, setSearch] = useState('');
  const query = useDebouncedValue(search, 300);

  const rules = useArchiveRules();
  const save = useSaveArchiveRule();
  const chats = useChats();
  const dialogs = useUserbotDialogs(query, null);

  const change =
    (chatId: number) =>
    (
      kind: DialogKind,
      body: { enabled?: boolean; media_enabled?: boolean; notify?: boolean },
    ) =>
      save.mutate({ chatId, body: { kind, ...body } });

  const limited =
    save.error instanceof ApiError && save.error.detail === 'limit_reached';
  const used = rules.data?.groups_used ?? 0;
  const limit = rules.data?.groups_limit ?? null;
  const unavailable =
    dialogs.error instanceof ApiError && dialogs.error.status === 503;

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t('archive.chats.title')}</h1>
      </header>

      <div className="language-switch mb-4">
        {(['private', 'groups'] as const).map((value) => (
          <button
            className={`language-switch__btn ${tab === value ? 'language-switch__btn--active' : ''}`}
            key={value}
            onClick={() => setTab(value)}
            type="button"
          >
            {value === 'private'
              ? t('archive.chats.tabPrivate')
              : t('archive.chats.tabGroups')}
          </button>
        ))}
      </div>

      {save.isError && (
        <p className="prefix-editor__error">
          {limited
            ? t('archive.chats.limitReached')
            : t('archive.chats.saveError')}
        </p>
      )}

      {tab === 'private' && (
        <>
          <p className="section__hint mb-3">{t('archive.chats.privateHint')}</p>
          {(chats.isPending || rules.isPending) && (
            <div className="page__status">{t('archive.chats.loading')}</div>
          )}
          {(chats.isError || rules.isError) && (
            <div className="page__status page__status--error">
              {t('archive.chats.error')}
            </div>
          )}
          {chats.data && rules.data && (
            <div className={CARD}>
              {chats.data.map((chat) => (
                <PrivateChatRow
                  chatId={chat.chat_id}
                  key={chat.chat_id}
                  onChange={change(chat.chat_id)}
                  rule={ruleFor(rules.data, chat.chat_id, 'private')}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'groups' && (
        <>
          <p className="section__hint mb-3">{t('archive.chats.groupsHint')}</p>
          <p className="text-hint mb-3 text-sm">
            {limit === null
              ? t('archive.chats.limitFree', { used })
              : t('archive.chats.limit', { used, limit })}
          </p>
          <input
            className="archive-filters__search mb-3"
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('archive.chats.search')}
            value={search}
          />
          {dialogs.isPending && (
            <div className="page__status">{t('archive.chats.loading')}</div>
          )}
          {unavailable && (
            <div className="page__status">
              {t('archive.chats.unavailable')}{' '}
              <Link className="text-accent" to={ROUTES.userbot}>
                {t('archive.chats.openUserbot')}
              </Link>
            </div>
          )}
          {dialogs.isError && !unavailable && (
            <div className="page__status page__status--error">
              {t('archive.chats.error')}
            </div>
          )}
          {dialogs.data && dialogs.data.length === 0 && (
            <div className="page__status">{t('archive.chats.empty')}</div>
          )}
          {dialogs.data && rules.data && dialogs.data.length > 0 && (
            <div className={CARD}>
              {dialogs.data.map((dialog) => (
                <DialogRow
                  dialog={dialog}
                  key={dialog.id}
                  onChange={change(dialog.id)}
                  rule={ruleFor(rules.data, dialog.id, dialog.kind)}
                />
              ))}
            </div>
          )}
          {dialogs.hasNextPage && (
            <button
              className="text-accent mt-3 w-full py-2"
              disabled={dialogs.isFetchingNextPage}
              onClick={() => void dialogs.fetchNextPage()}
              type="button"
            >
              {t('archive.chats.more')}
            </button>
          )}
        </>
      )}
    </div>
  );
}
