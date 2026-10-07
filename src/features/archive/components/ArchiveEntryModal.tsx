import { useLocale } from "@/i18n";
import { BottomSheet } from "@/shared/ui/BottomSheet/BottomSheet";
import { useChatInfo } from "../hooks/useChatInfo";
import type { ArchiveEntry } from "../types";
import { ArchiveAvatar } from "./ArchiveAvatar";

interface Props {
  entry: ArchiveEntry | null;
  onClose: () => void;
}

export function ArchiveEntryModal({ entry, onClose }: Props) {
  const { t, locale } = useLocale();
  const info = useChatInfo(entry?.chat_id ?? null);
  const displayName = info?.full_name || t("archive.unknownSender");
  const isDeleted = entry?.event === "deleted";

  return (
    <BottomSheet open={entry !== null} onClose={onClose}>
      {entry && (
        <div className="archive-modal">
          <div className="archive-modal__header">
            <ArchiveAvatar fallbackLabel={displayName} userId={entry.chat_id} />
            <div>
              <h2 className="archive-modal__name">{displayName}</h2>
              {info?.username && (
                <span className="archive-modal__username">@{info.username}</span>
              )}
            </div>
          </div>

          <p className="archive-modal__event">
            {isDeleted ? t("archive.eventDeleted") : t("archive.eventEdited")} ·{" "}
            {new Date(entry.created_at * 1000).toLocaleString(locale)}
          </p>

          {isDeleted ? (
            <p className="archive-modal__text">
              {entry.old_text || t("archive.mediaPlaceholder")}
            </p>
          ) : (
            <>
              <h3 className="command-modal__section-title">{t("archive.before")}</h3>
              <p className="archive-modal__text archive-modal__text--old">{entry.old_text}</p>
              <h3 className="command-modal__section-title">{t("archive.after")}</h3>
              <p className="archive-modal__text">{entry.new_text}</p>
            </>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
