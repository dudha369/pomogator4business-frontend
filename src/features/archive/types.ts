import type { Schema } from '@/shared/api/schema';

export type ArchiveEventType = Schema<'ArchiveEntry'>['event'];

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

type ArchiveEditKind =
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

/** Снимок сообщения «как было» / «как стало». Схема бэкенда отдаёт `kind`, форму
 * `entities`/`forward` и т.п. как строки и словари — здесь они сужены до известных. */
export type ArchiveContent = Omit<
  Schema<'SnapshotView'>,
  'kind' | 'entities' | 'payload' | 'forward' | 'media_group_id' | 'transcript'
> & {
  kind: ArchiveKind;
  entities: ArchiveEntity[] | null;
  /** форма зависит от типа сообщения Telegram */
  payload: Record<string, any> | null;
  forward: ArchiveForward | null;
  /** общий id у сообщений одного альбома */
  media_group_id?: string | null;
  /** распознанный текст голосового */
  transcript?: string | null;
};
type ArchiveSort = 'desc' | 'asc';

export type ArchiveEntry = Omit<
  Schema<'ArchiveEntry'>,
  'kind' | 'edit_kind' | 'media_type' | 'old' | 'new'
> & {
  kind: ArchiveKind | null;
  edit_kind: ArchiveEditKind | null;
  media_type: ArchiveMediaType | null;
  /** null у записей, сделанных до перехода на снимки */
  old: ArchiveContent | null;
  new: ArchiveContent | null;
};

export type ArchivePage = Omit<Schema<'ArchivePage'>, 'entries'> & {
  entries: ArchiveEntry[];
};

export interface ArchiveFilters {
  event: ArchiveEventType | null;
  search: string;
  chatId: number | null;
  /** YYYY-MM-DD в локальном времени пользователя, "" — без ограничения */
  dateFrom: string;
  dateTo: string;
  /** точный промежуток в unix-секундах (ссылка из сводки о массовом удалении);
   * важнее dateFrom/dateTo */
  fromTs: number | null;
  toTs: number | null;
  sort: ArchiveSort;
}

export const DEFAULT_ARCHIVE_FILTERS: ArchiveFilters = {
  event: null,
  search: '',
  chatId: null,
  dateFrom: '',
  dateTo: '',
  fromTs: null,
  toTs: null,
  sort: 'desc',
};

export type AlbumStyle = 'slideshow' | 'collage' | 'list';

/** Как владелец хочет видеть уведомления архива в чате с ботом. */
export type ArchivePrefs = Omit<
  Schema<'ArchivePrefsOut'>,
  'rich_kinds' | 'album_style'
> & {
  rich_kinds: ArchiveMediaType[];
  album_style: AlbumStyle;
};

export interface ArchivePrefsResponse {
  prefs: ArchivePrefs;
  options: { album_style: AlbumStyle[]; rich_kinds: ArchiveMediaType[] };
}

/** Правила архива по чатам (бизнес-бот и юзербот), только отклонения от умолчаний. */
export type ArchiveRules = Schema<'RulesOut'>;
export type ArchiveRule = Schema<'RuleOut'>;
export type ArchiveRuleBody = Schema<'RuleIn'>;
export type DialogKind = Schema<'DialogOut'>['kind'];
export type UserbotDialog = Schema<'DialogOut'>;
export type UserbotDialogs = Schema<'DialogsOut'>;
