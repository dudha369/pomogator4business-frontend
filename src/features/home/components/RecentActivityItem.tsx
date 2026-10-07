import { Link } from "react-router-dom";

import { useLocale } from "@/i18n";
import { ArchiveAvatar } from "@/features/archive/components/ArchiveAvatar";
import { useChatInfo } from "@/features/archive/hooks/useChatInfo";
import type { ArchiveEntry } from "@/features/archive/types";
import { formatRelativeTime } from "@/shared/utils/relativeTime";

interface Props {
  entry: ArchiveEntry;
}

export function RecentActivityItem({ entry }: Props) {
  const { t, locale } = useLocale();
  const info = useChatInfo(entry.chat_id);
  const displayName = info?.full_name || t("archive.unknownSender");
  const isDeleted = entry.event === "deleted";
  const text = (isDeleted ? entry.old_text : entry.new_text) || t("archive.mediaPlaceholder");

  return (
    <div className="recent-activity-item">
      <ArchiveAvatar fallbackLabel={displayName} userId={entry.chat_id} />
      <div className="recent-activity-item__body">
        <div className="recent-activity-item__header">
          <span className="recent-activity-item__name">{displayName}</span>
          {info?.username && (
            <span className="recent-activity-item__username">@{info.username}</span>
          )}
          <span className="recent-activity-item__time">
            {formatRelativeTime(entry.created_at, locale)}
          </span>
        </div>
        <p className="recent-activity-item__text">
          {isDeleted ? "🗑 " : "✏️ "}
          {text}
        </p>
        <Link
          className="recent-activity-item__link"
          to={`/archive?chat_id=${entry.chat_id}`}
        >
          {t("home.viewAllFromUser")} →
        </Link>
      </div>
    </div>
  );
}