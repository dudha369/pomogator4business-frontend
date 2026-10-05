import { useLocale } from "@/i18n";
import type { ArchiveEntry } from "../types";

interface Props {
  entry: ArchiveEntry;
}

function formatTime(unixSeconds: number, locale: string): string {
  return new Date(unixSeconds * 1000).toLocaleString(locale, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ArchiveEntryCard({ entry }: Props) {
  const { t, locale } = useLocale();
  const isDeleted = entry.event === "deleted";

  return (
    <div className={`archive-entry ${isDeleted ? "archive-entry--deleted" : "archive-entry--edited"}`}>
      <div className="archive-entry__header">
        <span className="archive-entry__icon">{isDeleted ? "🗑" : "✏️"}</span>
        <span className="archive-entry__label">
          {isDeleted ? t("archive.eventDeleted") : t("archive.eventEdited")}
        </span>
        <span className="archive-entry__time">{formatTime(entry.created_at, locale)}</span>
      </div>

      {isDeleted ? (
        <p className="archive-entry__text">{entry.old_text || t("archive.mediaPlaceholder")}</p>
      ) : (
        <>
          <p className="archive-entry__text archive-entry__text--old">{entry.old_text}</p>
          <p className="archive-entry__text archive-entry__text--new">{entry.new_text}</p>
        </>
      )}
    </div>
  );
}