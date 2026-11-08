import {
  BarChart3,
  BookOpen,
  Camera,
  CircleDot,
  Dices,
  FileText,
  Film,
  Gift,
  Image,
  ListChecks,
  type LucideIcon,
  MapPin,
  MessageSquare,
  Mic,
  Music,
  Paperclip,
  Pencil,
  Smile,
  Star,
  Trash2,
  User,
  Video,
} from 'lucide-react';

import type { ArchiveKind } from './types';

/**
 * ВСЕ иконки архива — здесь. Бэкенд отдаёт только `kind`, а какую иконку и какую
 * подпись показать, решает фронтенд (подписи — в locales/archive.ts, ключи
 * `archive.kind.<kind>`). Чтобы поставить свои иконки, достаточно заменить
 * значения в этих двух объектах — например, на собственные SVG-компоненты.
 */
export const KIND_ICONS: Record<ArchiveKind, LucideIcon> = {
  text: MessageSquare,
  photo: Image,
  video: Video,
  voice: Mic,
  video_note: CircleDot,
  animation: Film,
  audio: Music,
  sticker: Smile,
  document: FileText,
  location: MapPin,
  venue: MapPin,
  contact: User,
  poll: BarChart3,
  dice: Dices,
  gift: Gift,
  unique_gift: Gift,
  story: BookOpen,
  checklist: ListChecks,
  paid_media: Star,
  live_photo: Camera,
  other: Paperclip,
};

export const EVENT_ICONS = {
  deleted: Trash2,
  edited: Pencil,
} as const;

export function KindIcon({
  kind,
  className = 'size-4',
}: {
  kind: ArchiveKind;
  className?: string;
}) {
  const Icon = KIND_ICONS[kind] ?? Paperclip;
  return <Icon aria-hidden className={className} />;
}
