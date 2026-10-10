import { useEffect, useState } from "react";

import { useLocale } from "@/i18n";
import { fetchChats, setFavorite } from "./api";
import { ChatRow } from "./components/ChatRow";
import { ReadAllPanel } from "./components/ReadAllPanel";
import type { ChatItem } from "./types";

type LoadState = "loading" | "ready" | "error";

export function ChatsPage() {
  const { t } = useLocale();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetchChats()
      .then((items) => {
        if (cancelled) return;
        setChats(items);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggleFavorite(chat: ChatItem) {
    const next = !chat.favorite;
    const apply = (value: boolean) =>
      setChats((prev) =>
        prev.map((c) => (c.chat_id === chat.chat_id ? { ...c, favorite: value } : c))
      );
    apply(next);
    try {
      await setFavorite(chat.chat_id, next);
    } catch {
      apply(!next);
    }
  }

  // избранные сверху, внутри групп порядок «свежие сверху» сохраняется
  const sorted = [...chats].sort((a, b) => Number(b.favorite) - Number(a.favorite));

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("chats.title")}</h1>
        {state === "ready" && <span className="page__count">{chats.length}</span>}
      </header>

      <ReadAllPanel />

      {state === "loading" && <div className="page__status">{t("chats.loading")}</div>}
      {state === "error" && (
        <div className="page__status page__status--error">{t("chats.error")}</div>
      )}
      {state === "ready" && chats.length === 0 && (
        <div className="page__status">{t("chats.empty")}</div>
      )}

      {state === "ready" && chats.length > 0 && (
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
          {sorted.map((chat) => (
            <ChatRow chat={chat} key={chat.chat_id} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
