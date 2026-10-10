import { useLocale } from "@/i18n";
import { formatRelativeTime } from "@/shared/utils/relativeTime";
import { useChatInfo } from "../hooks/useChatInfo";
import type { ArchiveEntry } from "../types";
import { ArchiveAvatar } from "./ArchiveAvatar";
import { MEDIA_ICONS } from "./ArchiveMedia";

interface Props {
  entry: ArchiveEntry;
  onOpen: () => void;
}

export function ArchiveEntryCard({ entry, onOpen }: Props) {
  const { t, locale } = useLocale();
  const info = useChatInfo(entry.chat_id);
  const isDeleted = entry.event === "deleted";
  const displayName = info?.full_name || t("archive.unknownSender");

  return (
    <button className="archive-entry" onClick={onOpen} type="button">
      <ArchiveAvatar fallbackLabel={displayName} userId={entry.chat_id} />
      <div className="archive-entry__body">
        <div className="archive-entry__header">
          <span className="archive-entry__name">{displayName}</span>
          {info?.username && <span className="archive-entry__username">@{info.username}</span>}
          <span className="archive-entry__icon">{isDeleted ? "🗑" : "✏️"}</span>
        </div>
        <p className="archive-entry__preview">
          {entry.media_type && `${MEDIA_ICONS[entry.media_type]} `}
          {(isDeleted ? entry.old_text : entry.new_text) || t("archive.mediaPlaceholder")}
        </p>
        <span className="archive-entry__time">
          {formatRelativeTime(entry.created_at, locale)}
        </span>
      </div>
    </button>
  );
}
