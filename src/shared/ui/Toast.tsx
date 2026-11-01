import { useTheme } from '@/shared/context/ThemeContext';
import { useTelegram } from '@/shared/hooks/useTelegram';

interface ToastProps {
  message: string | null;
}

export const Toast = ({ message }: ToastProps) => {
  const theme = useTheme();
  const { safeTop } = useTelegram();

  return (
    <div
      className="pointer-events-none fixed inset-0 z-60 flex h-[20dvh] w-full justify-center px-4 pt-4"
      style={{ top: safeTop }}
    >
      <div
        className="h-12 w-full items-center rounded-2xl py-3 text-center text-base font-medium transition-opacity duration-300"
        style={{
          backgroundColor: theme.section_bg_color,
          opacity: message ? 1 : 0,
          color: theme.text_color,
        }}
      >
        {message}
      </div>
    </div>
  );
};
