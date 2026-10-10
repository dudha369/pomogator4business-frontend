import { useLocale } from "@/i18n";
import { useChatInfo } from "../hooks/useChatInfo";
import { ArchiveDateSortBar } from "./ArchiveDateSortBar";
import type { ArchiveEventType, ArchiveFilters as Filters } from "../types";

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

const EVENT_OPTIONS: (ArchiveEventType | null)[] = [null, "edited", "deleted"];

export function ArchiveFiltersBar({ filters, onChange }: Props) {
  const { t } = useLocale();
  const chatInfo = useChatInfo(filters.chatId);

  return (
    <div className="archive-filters">
      <div className="archive-filters__event-row">
        {EVENT_OPTIONS.map((opt) => (
          <button
            className={`archive-filters__pill ${filters.event === opt ? "archive-filters__pill--active" : ""}`}
            key={opt ?? "all"}
            onClick={() => onChange({ ...filters, event: opt })}
            type="button"
          >
            {opt === null
              ? t("archive.filterAll")
              : opt === "edited"
                ? t("archive.eventEdited")
                : t("archive.eventDeleted")}
          </button>
        ))}
      </div>

      {filters.chatId !== null && (
        <button
          className="archive-filters__chip"
          onClick={() => onChange({ ...filters, chatId: null })}
          type="button"
        >
          {chatInfo?.full_name || t("archive.unknownSender")} ✕
        </button>
      )}

      <input
        className="archive-filters__search"
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder={t("archive.searchPlaceholder")}
        value={filters.search}
      />

      <ArchiveDateSortBar filters={filters} onChange={onChange} />
    </div>
  );
}
