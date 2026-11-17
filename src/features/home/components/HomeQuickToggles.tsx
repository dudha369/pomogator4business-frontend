import { Link } from 'react-router-dom';

import { useToggleEmojiStatus } from '@/features/account/hooks/useAccount';
import { useLocale } from '@/shared/i18n';
import { ROUTES } from '@/shared/constants/routes';
import { Switch } from '@/shared/ui/Switch';

interface Props {
  emojiStatusGranted: boolean;
  emojiStatusEnabled: boolean;
  mirrorConnected: boolean;
}

const ROW = 'flex items-center justify-between gap-3 px-4 py-3';

export function HomeQuickToggles({
  emojiStatusGranted,
  emojiStatusEnabled,
  mirrorConnected,
}: Props) {
  const { t } = useLocale();
  const toggle = useToggleEmojiStatus();
  // пока переключатель в пути — показываем выбор пользователя, потом — данные сервера
  const emojiOn = toggle.isPending ? toggle.variables : emojiStatusEnabled;

  return (
    <div className="divide-line border-line bg-card mb-4 divide-y overflow-hidden rounded-2xl border">
      <div className={ROW}>
        <div className="flex min-w-0 flex-col">
          <span className="text-fg">{t('home.emojiStatus')}</span>
          {!emojiStatusGranted && (
            <Link className="text-accent text-xs" to={ROUTES.account}>
              {t('home.emojiNeedsAccess')}
            </Link>
          )}
        </div>
        <Switch
          checked={emojiStatusGranted && emojiOn}
          disabled={!emojiStatusGranted || toggle.isPending}
          onChange={toggle.mutate}
        />
      </div>

      <Link className={ROW} to={ROUTES.settings}>
        <span className="text-fg">{t('home.mirror')}</span>
        <span
          className={
            mirrorConnected ? 'text-accent text-sm' : 'text-hint text-sm'
          }
        >
          {mirrorConnected ? t('home.mirrorOn') : t('home.mirrorSetup')} →
        </span>
      </Link>
    </div>
  );
}
