import { Star } from "lucide-react";

import { ArchiveAvatar } from "@/features/archive/components/ArchiveAvatar";
import { useChatInfo } from "@/features/archive/hooks/useChatInfo";
import { useLocale } from "@/i18n";
import { formatRelativeTime } from "@/shared/utils/relativeTime";
import type { ChatItem } from "../types";

interface Props {
  chat: ChatItem;
  onToggleFavorite: (chat: ChatItem) => void;
}

export function ChatRow({ chat, onToggleFavorite }: Props) {
  const { t, locale } = useLocale();
  const info = useChatInfo(chat.chat_id);
  const name = info?.full_name || t("archive.unknownSender");

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <ArchiveAvatar fallbackLabel={name} userId={chat.chat_id} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-fg">{name}</span>
        <span className="truncate text-xs text-hint">
          {info?.username ? `@${info.username} · ` : ""}
          {chat.last_incoming_at !== null
            ? t("chats.lastIncoming", { time: formatRelativeTime(chat.last_incoming_at, locale) })
            : t("chats.noIncoming")}
        </span>
      </div>
      <button
        aria-label={chat.favorite ? t("chats.favoriteRemove") : t("chats.favoriteAdd")}
        aria-pressed={chat.favorite}
        className="flex size-10 items-center justify-center rounded-full active:opacity-60"
        onClick={() => onToggleFavorite(chat)}
        type="button"
      >
        <Star
          className={chat.favorite ? "text-accent" : "text-hint"}
          fill={chat.favorite ? "currentColor" : "none"}
          size={22}
        />
      </button>
    </div>
  );
}
