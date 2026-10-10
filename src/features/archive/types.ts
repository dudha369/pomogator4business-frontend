export type ArchiveEventType = "edited" | "deleted";

export type ArchiveMediaType = "photo" | "video" | "voice" | "video_note";
export type ArchiveSort = "desc" | "asc";

export interface ArchiveEntry {
  log_id: number;
  chat_id: number;
  message_id: number;
  event: ArchiveEventType;
  old_text: string | null;
  new_text: string | null;
  created_at: number;
  media_type: ArchiveMediaType | null;
}

export interface ArchivePage {
  entries: ArchiveEntry[];
  has_more: boolean;
  next_before_id: number | null;
}

export interface ArchiveFilters {
  event: ArchiveEventType | null;
  search: string;
  chatId: number | null;
  /** YYYY-MM-DD в локальном времени пользователя, "" — без ограничения */
  dateFrom: string;
  dateTo: string;
  sort: ArchiveSort;
}

export const DEFAULT_ARCHIVE_FILTERS: ArchiveFilters = {
  event: null,
  search: "",
  chatId: null,
  dateFrom: "",
  dateTo: "",
  sort: "desc",
};
