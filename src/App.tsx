import { useEffect, useRef, useState } from 'react';
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigation,
} from 'react-router-dom';
import { settingsButton } from '@tma.js/sdk-react';

import { LoadingScreen } from '@/shared/ui/loading/LoadingScreen';
import { ErrorScreen } from '@/shared/ui/loading/ErrorScreen';
import { NavBar } from 'src/shared/ui/NavBar/NavBar';

import { useTelegram } from '@/shared/hooks/useTelegram';
import { useBackButton } from '@/shared/hooks/useBackButton';
import { useDelayedFlag } from '@/shared/hooks/useDelayedFlag';
import { useUserSession } from '@/shared/hooks/useUserSession';
import { useTheme } from '@/shared/context/ThemeContext';
import { NavBarContext } from '@/shared/context/NavBarContext';
import { ScrollContainerContext } from '@/shared/context/ScrollContainerContext';
import { ROOT_PATHS, ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';

/**
 * Корневой layout. Отвечает за три вещи:
 *  1. что показать вместо приложения, пока нет валидной сессии
 *     (загрузка / не из Telegram / сессия протухла / сервер лежит);
 *  2. «оболочку» вокруг страниц: safe-area, единый скролл-контейнер, навбар;
 *  3. нативные элементы Telegram: кнопка настроек в шапке и кнопка «Назад».
 */
export function App() {
  const { ready, safeTop } = useTelegram();
  const theme = useTheme();
  const session = useUserSession(ready);

  const location = useLocation();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const scrollContainerRef = useRef<HTMLElement>(null);
  const [navBarHidden, setNavBarHidden] = useState(false);

  const isSessionReady = session.status === 'ready';
  const isRootPage = ROOT_PATHS.includes(location.pathname);

  // Кнопка настроек в шапке Telegram → /settings
  useEffect(() => {
    if (!ready || !isSessionReady) return;
    if (!settingsButton.isMounted()) return;

    const off = settingsButton.onClick(() => navigate(ROUTES.settings));
    settingsButton.show();

    return () => {
      off();
      settingsButton.hide();
    };
  }, [navigate, ready, isSessionReady]);

  // Системная «Назад»: на корневых вкладках скрыта, на остальных — шаг назад.
  // Если страницу открыли напрямую (истории нет) — ведём на главную.
  useBackButton(() => {
    if (location.key === 'default') {
      navigate(ROUTES.home, { replace: true });
    } else {
      navigate(-1);
    }
  }, isSessionReady && !isRootPage);

  // Смена страницы: навбар не должен оставаться скрытым с прошлой страницы,
  // а скролл — унаследоваться (контейнер один на все страницы).
  useEffect(() => {
    setNavBarHidden(false);
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [location.pathname]);

  // Индикатор загрузки чанка — только если переход реально затянулся
  const isNavigating = useDelayedFlag(navigation.state === 'loading');

  return (
    <div
      className="relative flex h-full flex-col"
      style={{
        backgroundColor: theme.bg_color,
        color: theme.text_color,
        paddingTop: safeTop,
      }}
    >
      {session.status === 'booting' ? (
        <LoadingScreen />
      ) : session.status === 'auth_error' ? (
        <ErrorScreen errorType="no_telegram" />
      ) : session.status === 'session_expired' ? (
        <ErrorScreen
          errorType="session_expired"
          onRetry={() => window.location.reload()}
        />
      ) : session.status === 'access_denied' ? (
        <ErrorScreen errorType="access_denied" />
      ) : session.status === 'maintenance' ? (
        <ErrorScreen
          errorType="maintenance"
          onRetry={() => window.location.reload()}
        />
      ) : session.status === 'error' ? (
        <ErrorScreen errorType={session.kind} onRetry={session.retry} />
      ) : (
        <NavBarContext.Provider value={{ setHidden: setNavBarHidden }}>
          <ScrollContainerContext.Provider value={scrollContainerRef}>
            <main
              ref={scrollContainerRef}
              className={cn(
                'relative mx-auto flex w-full flex-1 flex-col overflow-y-auto overscroll-y-contain',
                // Место под навбар (он position: fixed) + safe-area снизу
                !navBarHidden &&
                  'pb-[calc(104px+max(var(--safe-bottom),env(safe-area-inset-bottom)))]',
              )}
            >
              <Outlet />
            </main>
          </ScrollContainerContext.Provider>

          {!navBarHidden && <NavBar />}
          {isNavigating && <LoadingScreen />}
        </NavBarContext.Provider>
      )}
    </div>
  );
}
