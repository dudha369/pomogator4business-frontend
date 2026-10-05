export type ArchiveEventType = "edited" | "deleted";

export interface ArchiveEntry {
  log_id: number;
  chat_id: number;
  message_id: number;
  event: ArchiveEventType;
  old_text: string | null;
  new_text: string | null;
  created_at: number;
}

export interface ArchivePage {
  entries: ArchiveEntry[];
  has_more: boolean;
  next_before_id: number | null;
}