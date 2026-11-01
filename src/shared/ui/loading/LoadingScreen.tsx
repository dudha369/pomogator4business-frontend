import { LoaderCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '@/i18n';
import { withOpacity } from '../../lib/colors';

export const LoadingScreen = () => {
  const theme = useTheme();
  const { t } = useLocale();

  return (
    <div
      className="fixed inset-0 z-999 backdrop-blur-sm"
      style={{ backgroundColor: withOpacity(theme.bg_color, 0.85) }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <LoaderCircle
          className="animate-spin"
          style={{ color: theme.hint_color }}
          size={42}
        />
      </div>
      <p
        className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-9 text-sm font-medium tracking-widest uppercase"
        style={{ color: theme.hint_color }}
      >
        {t('loading')}
      </p>
    </div>
  );
};
