type Dict = Record<string, string>;

export const COMMON: { ru: Dict; en: Dict; uk: Dict } = {
  ru: {
    'nav.home': 'Обзор',
    'nav.commands': 'Команды',
    'nav.archive': 'Архив',
    'nav.settings': 'Настройки',
    'nav.account': 'Аккаунт',

    loading: 'Загрузка',
    'buttons.retry': 'Повторить',
    'buttons.home': 'На главную',
    'buttons.open_bot': 'Открыть бота',

    'errors.network.title': 'Нет соединения',
    'errors.network.subtitle': 'Проверьте интернет и попробуйте ещё раз',
    'errors.general.title': 'Что-то пошло не так',
    'errors.general.subtitle':
      'Произошла непредвиденная ошибка. Попробуйте ещё раз',
    'errors.no_telegram.title': 'Откройте через Telegram',
    'errors.no_telegram.subtitle':
      'Это приложение работает только внутри Telegram',
    'errors.access_denied.title': 'Нет доступа',
    'errors.access_denied.subtitle':
      'У вас нет прав для использования приложения',
    'errors.maintenance.title': 'Технические работы',
    'errors.maintenance.subtitle': 'Сервис скоро вернётся — зайдите чуть позже',
    'errors.session_expired.title': 'Сессия истекла',
    'errors.session_expired.subtitle':
      'Закройте приложение и откройте его заново из бота',
    'errors.not_found.title': 'Страница не найдена',
    'errors.not_found.subtitle': 'Такой страницы не существует',
  },
  en: {
    'nav.home': 'Home',
    'nav.commands': 'Commands',
    'nav.archive': 'Archive',
    'nav.settings': 'Settings',
    'nav.account': 'Account',

    loading: 'Loading',
    'buttons.retry': 'Retry',
    'buttons.home': 'Go home',
    'buttons.open_bot': 'Open the bot',

    'errors.network.title': 'No connection',
    'errors.network.subtitle': 'Check your internet connection and try again',
    'errors.general.title': 'Something went wrong',
    'errors.general.subtitle': 'An unexpected error occurred. Please try again',
    'errors.no_telegram.title': 'Open in Telegram',
    'errors.no_telegram.subtitle': 'This app only works inside Telegram',
    'errors.access_denied.title': 'Access denied',
    'errors.access_denied.subtitle':
      "You don't have permission to use this app",
    'errors.maintenance.title': 'Maintenance',
    'errors.maintenance.subtitle':
      "We'll be back soon — please check again later",
    'errors.session_expired.title': 'Session expired',
    'errors.session_expired.subtitle':
      'Close the app and reopen it from the bot',
    'errors.not_found.title': 'Page not found',
    'errors.not_found.subtitle': "This page doesn't exist",
  },
  uk: {
    'nav.home': 'Огляд',
    'nav.commands': 'Команди',
    'nav.archive': 'Архів',
    'nav.settings': 'Налаштування',
    'nav.account': 'Акаунт',

    loading: 'Завантаження',
    'buttons.retry': 'Повторити',
    'buttons.home': 'На головну',
    'buttons.open_bot': 'Відкрити бота',

    'errors.network.title': 'Немає з’єднання',
    'errors.network.subtitle': 'Перевірте інтернет і спробуйте ще раз',
    'errors.general.title': 'Щось пішло не так',
    'errors.general.subtitle':
      'Сталася непередбачувана помилка. Спробуйте ще раз',
    'errors.no_telegram.title': 'Відкрийте через Telegram',
    'errors.no_telegram.subtitle':
      'Цей застосунок працює лише всередині Telegram',
    'errors.access_denied.title': 'Немає доступу',
    'errors.access_denied.subtitle':
      'У вас немає прав для використання застосунку',
    'errors.maintenance.title': 'Технічні роботи',
    'errors.maintenance.subtitle':
      'Сервіс скоро повернеться — зайдіть трохи пізніше',
    'errors.session_expired.title': 'Сесія закінчилась',
    'errors.session_expired.subtitle':
      'Закрийте застосунок і відкрийте його знову з бота',
    'errors.not_found.title': 'Сторінку не знайдено',
    'errors.not_found.subtitle': 'Такої сторінки не існує',
  },
};
