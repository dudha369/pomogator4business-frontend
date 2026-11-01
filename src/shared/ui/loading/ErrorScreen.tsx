import type { ElementType } from 'react';
import {
  AlertTriangle,
  KeyRound,
  Lock,
  RefreshCw,
  SearchX,
  ShieldAlert,
  WifiOff,
  Wrench,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '@/i18n';
import { withOpacity } from '../../lib/colors';

export type ErrorType =
  | 'network'
  | 'general'
  | 'no_telegram'
  | 'access_denied'
  | 'maintenance'
  | 'session_expired'
  | 'not_found';

const CONFIG: Record<ErrorType, { Icon: ElementType; showRetry: boolean }> = {
  network: { Icon: WifiOff, showRetry: true },
  general: { Icon: AlertTriangle, showRetry: true },
  no_telegram: { Icon: ShieldAlert, showRetry: false },
  access_denied: { Icon: Lock, showRetry: false },
  maintenance: { Icon: Wrench, showRetry: true },
  session_expired: { Icon: KeyRound, showRetry: true },
  not_found: { Icon: SearchX, showRetry: true },
};

const BOT_URL: string | undefined = import.meta.env.VITE_BOT_URL;

interface ErrorScreenProps {
  errorType: ErrorType;
  onRetry?: () => void;
  retryLabel?: string;
  customMessage?: string;
}

export const ErrorScreen = ({
  errorType,
  onRetry,
  retryLabel,
  customMessage,
}: ErrorScreenProps) => {
  const theme = useTheme();
  const { t } = useLocale();
  const { Icon, showRetry } = CONFIG[errorType];

  return (
    <div
      className="fixed inset-0 z-999 flex flex-col items-center justify-center gap-5 backdrop-blur-sm"
      style={{ backgroundColor: withOpacity(theme.bg_color, 0.85) }}
    >
      <Icon
        className="animate-pulse"
        style={{
          color:
            errorType === 'maintenance'
              ? '#f59e0b'
              : theme.destructive_text_color,
        }}
        size={64}
      />

      <div className="px-6">
        <p
          className="text-center text-base font-medium tracking-widest uppercase"
          style={{ color: theme.text_color }}
        >
          {t(`errors.${errorType}.title`)}
        </p>

        <p
          className="mt-1 text-center text-sm font-medium"
          style={{ color: theme.hint_color }}
        >
          {customMessage ?? t(`errors.${errorType}.subtitle`)}
        </p>

        {errorType === 'no_telegram' && BOT_URL && (
          <a
            href={BOT_URL}
            className="mt-3 block text-center text-sm font-medium underline"
            style={{ color: theme.link_color }}
          >
            {t('buttons.open_bot')}
          </a>
        )}
      </div>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 flex items-center gap-2 rounded-xl px-6 py-2.5 text-base leading-none font-medium transition-transform duration-300 active:scale-95"
          style={{
            backgroundColor: theme.accent_color,
            color: theme.button_text_color,
          }}
        >
          <RefreshCw size={16} />
          {retryLabel ?? t('buttons.retry')}
        </button>
      )}
    </div>
  );
};
