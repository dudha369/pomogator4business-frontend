export type ArchiveEventType = 'edited' | 'deleted';

export type ArchiveMediaType =
  | 'photo'
  | 'video'
  | 'voice'
  | 'video_note'
  | 'animation'
  | 'audio'
  | 'sticker'
  | 'document';

/** Тип содержимого: файл, текст или данные без файла (геолокация, опрос…). */
export type ArchiveKind =
  | ArchiveMediaType
  | 'text'
  | 'location'
  | 'venue'
  | 'contact'
  | 'poll'
  | 'dice'
  | 'gift'
  | 'unique_gift'
  | 'story'
  | 'checklist'
  | 'paid_media'
  | 'live_photo'
  | 'other';

export type ArchiveEditKind =
  'text' | 'caption' | 'caption_removed' | 'media' | 'media_caption';

/** Форматирование текста (offset/length — в UTF-16, как в Telegram и в JS). */
export interface ArchiveEntity {
  type: string;
  offset: number;
  length: number;
  url?: string;
  custom_emoji_id?: string;
  language?: string;
}

export interface ArchiveForward {
  type: 'user' | 'hidden_user' | 'chat' | 'channel' | string;
  id?: number;
  name?: string | null;
  username?: string | null;
  message_id?: number | null;
  signature?: string | null;
}

/** Снимок сообщения «как было» / «как стало». */
export interface ArchiveContent {
  kind: ArchiveKind;
  text: string | null;
  entities: ArchiveEntity[] | null;
  show_caption_above: boolean;
  has_spoiler: boolean;
  has_file: boolean;
  file_size: number | null;
  too_large: boolean;
  mime: string | null;
  file_name: string | null;
  payload: Record<string, any> | null;
  forward: ArchiveForward | null;
  /** общий id у сообщений одного альбома */
  media_group_id?: string | null;
  /** распознанный текст голосового */
  transcript?: string | null;
}
export type ArchiveSort = 'desc' | 'asc';

export interface ArchiveEntry {
  log_id: number;
  chat_id: number;
  message_id: number;
  event: ArchiveEventType;
  old_text: string | null;
  new_text: string | null;
  created_at: number;
  media_type: ArchiveMediaType | null;
  media_available: boolean;
  kind?: ArchiveKind | null;
  edit_kind?: ArchiveEditKind | null;
  /** null у записей, сделанных до перехода на снимки */
  old?: ArchiveContent | null;
  new?: ArchiveContent | null;
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
  search: '',
  chatId: null,
  dateFrom: '',
  dateTo: '',
  sort: 'desc',
};

export type AlbumStyle = 'slideshow' | 'collage' | 'list';

/** Как владелец хочет видеть уведомления архива в чате с ботом. */
export interface ArchivePrefs {
  rich: boolean;
  rich_kinds: ArchiveMediaType[];
  album_style: AlbumStyle;
  collapse_media: boolean;
  edit_history: boolean;
  caption_edit_media: boolean;
  location_map: boolean;
  voice_transcript: boolean;
}

export interface ArchivePrefsResponse {
  prefs: ArchivePrefs;
  options: { album_style: AlbumStyle[]; rich_kinds: ArchiveMediaType[] };
}
