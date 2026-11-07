import { useLocale } from '@/i18n';
import { TgsSticker } from './TgsSticker';
import {
  type ArchiveMediaSide,
  useArchiveMedia,
} from '../hooks/useArchiveMedia';
import type { ArchiveContent, ArchiveMediaType } from '../types';

interface Props {
  logId: number;
  /** Какой файл брать: у правки медиа — «было» или «стало». */
  which?: ArchiveMediaSide;
  mediaType: ArchiveMediaType;
  content?: ArchiveContent | null;
}

export function ArchiveMedia({
                               logId,
                               which = 'auto',
                               mediaType,
                               content,
                             }: Props) {
  const { t } = useLocale();
  const media = useArchiveMedia(logId, which);

  if (media.status === 'loading') {
    return (
      <div className="text-hint py-6 text-center text-sm">
        {t('archive.mediaLoading')}
      </div>
    );
  }
  if (media.status === 'error') {
    return (
      <div className="text-hint py-6 text-center text-sm">
        {t('archive.mediaUnavailable')}
      </div>
    );
  }

  const spoiler = content?.has_spoiler ? 'blur-xl hover:blur-none' : '';

  switch (mediaType) {
    case 'photo':
      return (
        <img
          alt=""
          className={`border-line max-h-96 w-full rounded-2xl border object-contain ${spoiler}`}
          src={media.url}
        />
      );
    case 'voice':
      return <audio className="w-full" controls src={media.url} />;
    case 'audio': {
      const title = content?.payload?.title;
      const performer = content?.payload?.performer;
      return (
        <div className="space-y-1">
          {(title || performer) && (
            <p className="text-sm font-medium">
              {[performer, title].filter(Boolean).join(' — ')}
            </p>
          )}
          <audio className="w-full" controls src={media.url} />
        </div>
      );
    }
    case 'video_note':
      return (
        <video
          className="border-line mx-auto size-64 rounded-full border object-cover"
          controls
          playsInline
          src={media.url}
        />
      );
    case 'animation':
      return (
        <video
          autoPlay
          className="border-line max-h-96 w-full rounded-2xl border bg-black"
          loop
          muted
          playsInline
          src={media.url}
        />
      );
    case 'sticker': {
      const p = content?.payload;
      if (p?.is_animated) {
        return <TgsSticker fallback={p.emoji ?? '🖼'} url={media.url} />;
      }
      if (p?.is_video) {
        return (
          <video
            autoPlay
            className="mx-auto size-40 object-contain"
            loop
            muted
            playsInline
            src={media.url}
          />
        );
      }
      return (
        <img
          alt={p?.emoji ?? ''}
          className="mx-auto size-40 object-contain"
          src={media.url}
        />
      );
    }
    case 'document':
      return (
        <a
          className="border-line text-link flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm"
          download={content?.file_name ?? 'file'}
          href={media.url}
        >
          <span className="text-2xl">📄</span>
          <span className="truncate">
            {content?.file_name ?? t('archive.file')}
          </span>
        </a>
      );
    default:
      return (
        <video
          className={`border-line max-h-96 w-full rounded-2xl border bg-black ${spoiler}`}
          controls
          playsInline
          src={media.url}
        />
      );
  }
}