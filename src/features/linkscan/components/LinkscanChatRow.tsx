import { ArchiveAvatar } from '@/features/archive/components/ArchiveAvatar';
import { useChatInfo } from '@/features/archive/hooks/useChatInfo';
import { useLocale } from '@/shared/i18n';
import { Switch } from '@/shared/ui/Switch';

interface Props {
  chatId: number;
  selected: boolean;
  onChange: (chatId: number, selected: boolean) => void;
}

export function LinkscanChatRow({ chatId, selected, onChange }: Props) {
  const { t } = useLocale();
  const info = useChatInfo(chatId);
  const name = info?.full_name || t('archive.unknownSender');

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <ArchiveAvatar fallbackLabel={name} userId={chatId} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-fg truncate">{name}</span>
        {info?.username && (
          <span className="text-hint truncate text-xs">@{info.username}</span>
        )}
      </div>
      <Switch checked={selected} onChange={(on) => onChange(chatId, on)} />
    </div>
  );
}
