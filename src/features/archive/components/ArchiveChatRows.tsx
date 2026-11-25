import { Megaphone, User, Users } from 'lucide-react';

import { ArchiveAvatar } from '@/features/archive/components/ArchiveAvatar';
import { useChatInfo } from '@/features/archive/hooks/useChatInfo';
import type { DialogKind, UserbotDialog } from '@/features/archive/types';
import { useLocale } from '@/shared/i18n';
import { Switch } from '@/shared/ui/Switch';

const KIND_ICONS = {
  private: User,
  group: Users,
  supergroup: Users,
  channel: Megaphone,
} as const;

interface RuleState {
  enabled: boolean;
  media_enabled: boolean;
  notify: boolean;
}

interface ChangeBody {
  enabled?: boolean;
  media_enabled?: boolean;
  notify?: boolean;
}

/** Личный чат: аватар и имя берём у бота (он этих собеседников видел). */
export function PrivateChatRow({
  chatId,
  rule,
  onChange,
}: {
  chatId: number;
  rule: RuleState;
  onChange: (kind: DialogKind, body: ChangeBody) => void;
}) {
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
      <Switch
        checked={rule.enabled}
        onChange={(on) => onChange('private', { enabled: on })}
      />
    </div>
  );
}

/** Группа или канал из списка диалогов: включение, файлы, уведомления. */
export function DialogRow({
  dialog,
  rule,
  onChange,
}: {
  dialog: UserbotDialog;
  rule: RuleState;
  onChange: (kind: DialogKind, body: ChangeBody) => void;
}) {
  const { t } = useLocale();
  const Icon = KIND_ICONS[dialog.kind];
  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="archive-avatar archive-avatar--fallback">
          <Icon className="size-4" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-fg truncate">{dialog.title}</span>
          {dialog.username && (
            <span className="text-hint truncate text-xs">
              @{dialog.username}
            </span>
          )}
        </div>
        <Switch
          checked={rule.enabled}
          onChange={(on) => onChange(dialog.kind, { enabled: on })}
        />
      </div>
      {rule.enabled && (
        <div className="text-hint flex flex-wrap gap-x-6 gap-y-1 pl-11 text-sm">
          <label className="flex items-center gap-2">
            {t('archive.chats.files')}
            <Switch
              checked={rule.media_enabled}
              onChange={(on) => onChange(dialog.kind, { media_enabled: on })}
            />
          </label>
          <label className="flex items-center gap-2">
            {t('archive.chats.notify')}
            <Switch
              checked={rule.notify}
              onChange={(on) => onChange(dialog.kind, { notify: on })}
            />
          </label>
        </div>
      )}
    </div>
  );
}
