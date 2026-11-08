import { useLocale } from '@/i18n';
import type {
  ArchiveContent,
  ArchiveEntry,
  ArchiveForward,
  ArchiveMediaType,
} from '../types';
import type { ArchiveMediaSide } from '../hooks/useArchiveMedia';
import { EntityText } from './EntityText';
import { KindIcon } from '../kindIcons';
import { ArchiveMedia } from './ArchiveMedia';

const FILE_KINDS = new Set<string>([
  'photo',
  'video',
  'voice',
  'video_note',
  'animation',
  'audio',
  'sticker',
  'document',
]);

/** Содержимое записи: для старых записей (до снимков) собираем из плоских полей. */
export function contentOf(
  entry: ArchiveEntry,
  side: 'old' | 'new',
): ArchiveContent {
  const snap = entry[side];
  if (snap) return snap;
  return {
    kind: entry.media_type ?? 'text',
    text: side === 'old' ? entry.old_text : entry.new_text,
    entities: null,
    show_caption_above: false,
    has_spoiler: false,
    has_file: Boolean(entry.media_type) && entry.media_available,
    file_size: null,
    too_large: false,
    mime: null,
    file_name: null,
    payload: null,
    forward: null,
  };
}

function ForwardLabel({ forward }: { forward: ArchiveForward }) {
  const { t } = useLocale();
  const name = forward.name || forward.signature || '—';
  let href: string | null = null;
  if (forward.type === 'user') {
    href = forward.username
      ? `https://t.me/${forward.username}`
      : forward.id
        ? `tg://user?id=${forward.id}`
        : null;
  } else if (forward.username) {
    href = `https://t.me/${forward.username}${forward.message_id ? `/${forward.message_id}` : ''}`;
  }
  return (
    <p className="text-hint mb-2 text-sm">
      {t('archive.forwardedFrom')}{' '}
      {href ? (
        <a className="text-link" href={href} rel="noreferrer" target="_blank">
          {name}
        </a>
      ) : (
        <span>{name}</span>
      )}
    </p>
  );
}

function PayloadBlock({ content }: { content: ArchiveContent }) {
  const { t } = useLocale();
  const p = content.payload ?? {};
  const label = (
    <span className="inline-flex items-center gap-1.5">
      <KindIcon kind={content.kind} />
      {t(`archive.kind.${content.kind}`)}
    </span>
  );

  switch (content.kind) {
    case 'location':
    case 'venue': {
      const loc = content.kind === 'venue' ? p.location : p;
      const link = loc
        ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`
        : null;
      return (
        <div className="space-y-1 text-sm">
          <p className="font-medium">{label}</p>
          {content.kind === 'venue' && (
            <p>
              {p.title}
              {p.address ? `, ${p.address}` : ''}
            </p>
          )}
          {link && (
            <a
              className="text-link"
              href={link}
              rel="noreferrer"
              target="_blank"
            >
              {loc.latitude}, {loc.longitude}
            </a>
          )}
        </div>
      );
    }
    case 'contact':
      return (
        <div className="space-y-1 text-sm">
          <p className="font-medium">{label}</p>
          <p>
            {[p.first_name, p.last_name].filter(Boolean).join(' ')}{' '}
            {p.phone_number}
          </p>
        </div>
      );
    case 'poll':
      return (
        <div className="space-y-1 text-sm">
          <p className="font-medium">{label}</p>
          <p>{p.question}</p>
          <ul className="list-disc pl-5">
            {(p.options ?? []).map((option: { text: string }, i: number) => (
              <li key={i}>{option.text}</li>
            ))}
          </ul>
        </div>
      );
    case 'gift':
    case 'unique_gift': {
      const gift = p.gift ?? {};
      const title =
        content.kind === 'unique_gift'
          ? `${gift.base_name ?? gift.name ?? ''} #${gift.number ?? ''}`
          : gift.star_count
            ? `⭐ ${gift.star_count}`
            : '';
      return (
        <div className="space-y-1 text-sm">
          <p className="font-medium">{label}</p>
          {title && <p>{title}</p>}
          {p.text && <p className="whitespace-pre-wrap">{p.text}</p>}
        </div>
      );
    }
    case 'dice':
      return (
        <p className="text-sm">
          <span className="inline-flex items-center gap-1.5">
            <KindIcon kind="dice" />
            {t('archive.kind.dice')}: <strong>{p.value}</strong>
          </span>
        </p>
      );
    default:
      return <p className="text-sm font-medium">{label}</p>;
  }
}

interface Props {
  logId: number;
  entry: ArchiveEntry;
  content: ArchiveContent;
  which: ArchiveMediaSide;
  /** в альбоме «переслано от» показываем один раз, у первого элемента */
  hideForward?: boolean;
}

/** Одно «состояние» сообщения: пересылка, файл или данные, текст/подпись. */
export function ArchiveContentView({
  logId,
  content,
  which,
  hideForward = false,
}: Props) {
  const { t } = useLocale();
  const isFile = FILE_KINDS.has(content.kind);
  const isGift = content.kind === 'gift' || content.kind === 'unique_gift';
  const captionFirst = content.show_caption_above;

  const text = content.text ? (
    <p className="archive-modal__text whitespace-pre-wrap">
      <EntityText entities={content.entities} text={content.text} />
    </p>
  ) : null;

  return (
    <div className="space-y-2">
      {content.forward && !hideForward && (
        <ForwardLabel forward={content.forward} />
      )}
      {captionFirst && text}
      {isFile &&
        (content.has_file && !content.too_large ? (
          <ArchiveMedia
            content={content}
            logId={logId}
            mediaType={content.kind as ArchiveMediaType}
            which={which}
          />
        ) : (
          <p className="text-hint py-4 text-center text-sm">
            {content.too_large
              ? t('archive.tooLarge')
              : t('archive.mediaUnavailable')}
          </p>
        ))}
      {isGift && content.has_file && (
        <ArchiveMedia
          content={{ ...content, payload: content.payload?.sticker ?? null }}
          logId={logId}
          mediaType="sticker"
          which={which}
        />
      )}
      {!isFile && content.kind !== 'text' && <PayloadBlock content={content} />}
      {!captionFirst && text}
      {content.transcript && (
        <details className="bg-secondary rounded-xl px-3 py-2 text-sm">
          <summary className="cursor-pointer">
            {t('archive.transcript')}
          </summary>
          <p className="mt-1 whitespace-pre-wrap">{content.transcript}</p>
        </details>
      )}
      {!text && content.kind === 'text' && (
        <p className="archive-modal__text">{t('archive.mediaPlaceholder')}</p>
      )}
    </div>
  );
}
