import { useLocale } from '@/i18n';
import { useArchiveMedia } from '../hooks/useArchiveMedia';
import type { ArchiveMediaType } from '../types';

interface Props {
  logId: number;
  mediaType: ArchiveMediaType;
}

export function ArchiveMedia({ logId, mediaType }: Props) {
  const { t } = useLocale();
  const media = useArchiveMedia(logId);

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

  if (mediaType === 'photo') {
    return (
      <img
        alt=""
        className="border-line max-h-96 w-full rounded-2xl border object-contain"
        src={media.url}
      />
    );
  }
  if (mediaType === 'voice') {
    return <audio className="w-full" controls src={media.url} />;
  }
  if (mediaType === 'video_note') {
    return (
      <video
        className="border-line mx-auto size-64 rounded-full border object-cover"
        controls
        playsInline
        src={media.url}
      />
    );
  }
  return (
    <video
      className="border-line max-h-96 w-full rounded-2xl border bg-black"
      controls
      playsInline
      src={media.url}
    />
  );
}

export const MEDIA_ICONS: Record<ArchiveMediaType, string> = {
  photo: '🖼',
  video: '🎬',
  voice: '🎤',
  video_note: '⭕',
};
