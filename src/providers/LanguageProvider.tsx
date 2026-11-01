import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { initData } from '@tma.js/sdk-react';
import { useQueryClient } from '@tanstack/react-query';
import { LanguageContext } from '@/shared/context/LanguageContext';
import { useTelegram } from '@/shared/hooks/useTelegram';
import {
  SESSION_QUERY_KEY,
  useSessionQuery,
} from '@/shared/hooks/useUserSession';
import {
  loadAppSettings,
  peekAppSettings,
  saveAppSettings,
} from '@/shared/lib/appSettingsStorage';
import { localeApi, type LocaleResponse } from '@/shared/api/locale';
import { createTranslator } from '@/i18n/translate';
import {
  DEFAULT_LOCALE,
  fromTelegramLocale,
  isLocaleCode,
  type LocaleCode,
} from '@/i18n/types';

/**
 * Порядок разрешения языка:
 *  1. localStorage-зеркало — мгновенно, на первом кадре;
 *  2. CloudStorage (после ready) — выбор пользователя, синхронизирован между устройствами;
 *  3. language_code клиента Telegram — если выбора ещё не было;
 *  4. БЭКЕНД (приходит с запросом сессии) — главный источник: на этом языке
 *     бот отвечает в чатах, поэтому интерфейс обязан с ним совпадать.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { ready } = useTelegram();
  const queryClient = useQueryClient();
  const session = useSessionQuery(ready);

  const [locale, setLocaleState] = useState<LocaleCode>(
    () => peekAppSettings().language ?? DEFAULT_LOCALE,
  );
  const localeRef = useRef(locale);
  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  // 2–3: пока бэкенд не ответил (или лежит) — берём сохранённое / язык Telegram.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;

    loadAppSettings().then((settings) => {
      if (cancelled) return;
      if (settings.language) {
        setLocaleState(settings.language);
      } else if (!session.data) {
        let tgLanguage: string | undefined;
        try {
          tgLanguage = initData.user()?.language_code;
        } catch {
          // initData недоступен — остаёмся на дефолте
        }
        setLocaleState(fromTelegramLocale(tgLanguage));
      }
    });

    return () => {
      cancelled = true;
    };
    // session.data намеренно вне зависимостей: это только запасной путь на старте
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  // 4: бэкенд — источник истины.
  const backendLocale = session.data?.locale;
  useEffect(() => {
    if (!backendLocale || !isLocaleCode(backendLocale)) return;
    setLocaleState(backendLocale);
    void saveAppSettings({ language: backendLocale });
  }, [backendLocale]);

  const setLocale = useCallback(
    (next: LocaleCode) => {
      const previous = localeRef.current;
      if (next === previous) return;

      setLocaleState(next);
      void saveAppSettings({ language: next });
      queryClient.setQueryData<LocaleResponse>(SESSION_QUERY_KEY, {
        locale: next,
      });

      localeApi.update(next).catch((error: unknown) => {
        // Бэкенд не принял — откатываем, чтобы UI не расходился с языком бота.
        console.error('Failed to update locale', error);
        setLocaleState(previous);
        void saveAppSettings({ language: previous });
        queryClient.setQueryData<LocaleResponse>(SESSION_QUERY_KEY, {
          locale: previous,
        });
      });
    },
    [queryClient],
  );

  const value = useMemo(
    () => ({ locale, setLocale, t: createTranslator(locale) }),
    [locale, setLocale],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
