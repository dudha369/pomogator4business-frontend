import { useLocale } from '@/shared/i18n';
import { useChats, useToggleFavorite } from '@/features/chats/hooks/useChats';
import { ChatRow } from '@/features/chats/components/ChatRow';
import { ReadAllPanel } from '@/features/chats/components/ReadAllPanel';
import type { ChatItem } from '@/features/chats/types';

export function ChatsPage() {
  const { t } = useLocale();
  const { data: chats = [], isPending, isError } = useChats();
  const toggleFavorite = useToggleFavorite();

  function handleToggleFavorite(chat: ChatItem) {
    toggleFavorite.mutate({ chatId: chat.chat_id, favorite: !chat.favorite });
  }

  // избранные сверху, внутри групп порядок «свежие сверху» сохраняется
  const sorted = [...chats].sort(
    (a, b) => Number(b.favorite) - Number(a.favorite),
  );

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t('chats.title')}</h1>
        {!isPending && !isError && (
          <span className="page__count">{chats.length}</span>
        )}
      </header>

      <ReadAllPanel />

      {isPending && <div className="page__status">{t('chats.loading')}</div>}
      {isError && (
        <div className="page__status page__status--error">
          {t('chats.error')}
        </div>
      )}
      {!isPending && !isError && chats.length === 0 && (
        <div className="page__status">{t('chats.empty')}</div>
      )}

      {!isPending && !isError && chats.length > 0 && (
        <div className="divide-line border-line bg-card divide-y overflow-hidden rounded-2xl border">
          {sorted.map((chat) => (
            <ChatRow
              chat={chat}
              key={chat.chat_id}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
}
