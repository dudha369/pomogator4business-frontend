// src/features/archive/components/ArchiveAvatar.tsx
import { useAvatar } from "../hooks/useAvatar";

interface Props {
  userId: number;
  fallbackLabel: string;
}

export function ArchiveAvatar({ userId, fallbackLabel }: Props) {
  const url = useAvatar(userId);

  if (url) {
    return <img alt="" className="archive-avatar" src={url} />;
  }
  return (
    <div className="archive-avatar archive-avatar--fallback">
      {fallbackLabel.charAt(0).toUpperCase()}
    </div>
  );
}