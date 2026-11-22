export const RU = {
  'linkscan.title': 'Проверка ссылок и файлов',
  'linkscan.link': 'Проверка ссылок и файлов',
  'linkscan.loading': 'Загрузка…',
  'linkscan.error': 'Не удалось загрузить настройки',
  'linkscan.saveError': 'Не удалось сохранить, попробуйте ещё раз',
  'linkscan.intro':
    'Бот проверяет ссылки и файлы во входящих сообщениях, в том числе после редактирования, и пишет вам в личные сообщения, если что-то выглядит опасно. Проверка не идеальна: возможны ошибки в обе стороны.',
  'linkscan.enable': 'Проверять входящие',
  'linkscan.enableHint':
    'По умолчанию выключено. Ваши сообщения не меняются: бот только читает ссылки и файлы собеседников.',
  'linkscan.externalSection': 'Внешние сервисы',
  'linkscan.external': 'Использовать внешние сервисы',
  'linkscan.externalHint':
    'Включено: адреса ссылок отправляются в Google Safe Browsing, URLhaus и VirusTotal, а у файлов только контрольная сумма (SHA-256), сам файл никуда не уходит. Выключено: работают только проверки внутри бота (подмена адреса, похожие символы, сокращённые ссылки, опасные типы файлов), наружу ничего не отправляется.',
  'linkscan.providerOn': 'подключён',
  'linkscan.providerOff': 'не подключён',
  'linkscan.noProviders':
    'На сервере не заданы ключи сервисов, поэтому работают только проверки внутри бота. Ключи задаются переменными окружения: URLHAUS_AUTH_KEY, SAFE_BROWSING_API_KEY, VT_API_KEY.',
  'linkscan.chatsSection': 'Какие чаты проверять',
  'linkscan.scopeAll': 'Все чаты',
  'linkscan.scopeSelected': 'Выбранные',
  'linkscan.chatsHint': 'Отметьте чаты, которые нужно проверять.',
  'linkscan.filesHint':
    'Файлы: проверяется любой документ до 20 МБ (по контрольной сумме). Файлы больше 20 МБ Telegram боту не отдаёт: если тип файла опасный, бот так и напишет, что проверить его не смог.',
};

export const EN: Record<keyof typeof RU, string> = {
  'linkscan.title': 'Link and file checks',
  'linkscan.link': 'Link and file checks',
  'linkscan.loading': 'Loading…',
  'linkscan.error': 'Could not load settings',
  'linkscan.saveError': 'Could not save, please try again',
  'linkscan.intro':
    'The bot checks links and files in incoming messages, including after edits, and writes to you privately if something looks dangerous. The check is not perfect: mistakes are possible both ways.',
  'linkscan.enable': 'Check incoming messages',
  'linkscan.enableHint':
    "Off by default. Your messages are not changed: the bot only reads your contacts' links and files.",
  'linkscan.externalSection': 'External services',
  'linkscan.external': 'Use external services',
  'linkscan.externalHint':
    'On: link addresses are sent to Google Safe Browsing, URLhaus and VirusTotal; for files only the checksum (SHA-256) is sent, the file itself never leaves the server. Off: only checks inside the bot run (address spoofing, look-alike characters, short links, risky file types) and nothing is sent out.',
  'linkscan.providerOn': 'connected',
  'linkscan.providerOff': 'not connected',
  'linkscan.noProviders':
    'No service keys are set on the server, so only checks inside the bot run. Keys are set via environment variables: URLHAUS_AUTH_KEY, SAFE_BROWSING_API_KEY, VT_API_KEY.',
  'linkscan.chatsSection': 'Which chats to check',
  'linkscan.scopeAll': 'All chats',
  'linkscan.scopeSelected': 'Selected',
  'linkscan.chatsHint': 'Select the chats that should be checked.',
  'linkscan.filesHint':
    'Files: every document up to 20 MB is checked (by checksum). Telegram does not give bots files larger than 20 MB: for risky file types the bot will tell you it could not check them.',
};

export const UK: Record<keyof typeof RU, string> = {
  'linkscan.title': 'Перевірка посилань і файлів',
  'linkscan.link': 'Перевірка посилань і файлів',
  'linkscan.loading': 'Завантаження…',
  'linkscan.error': 'Не вдалося завантажити налаштування',
  'linkscan.saveError': 'Не вдалося зберегти, спробуйте ще раз',
  'linkscan.intro':
    'Бот перевіряє посилання та файли у вхідних повідомленнях, зокрема після редагування, і пише вам в особисті повідомлення, якщо щось виглядає небезпечно. Перевірка не ідеальна: можливі помилки в обидва боки.',
  'linkscan.enable': 'Перевіряти вхідні',
  'linkscan.enableHint':
    'За замовчуванням вимкнено. Ваші повідомлення не змінюються: бот лише читає посилання та файли співрозмовників.',
  'linkscan.externalSection': 'Зовнішні сервіси',
  'linkscan.external': 'Використовувати зовнішні сервіси',
  'linkscan.externalHint':
    'Увімкнено: адреси посилань надсилаються до Google Safe Browsing, URLhaus і VirusTotal, а для файлів лише контрольна сума (SHA-256), сам файл нікуди не йде. Вимкнено: працюють тільки перевірки всередині бота (підміна адреси, схожі символи, скорочені посилання, небезпечні типи файлів), назовні нічого не надсилається.',
  'linkscan.providerOn': 'підключено',
  'linkscan.providerOff': 'не підключено',
  'linkscan.noProviders':
    'На сервері не задано ключі сервісів, тому працюють лише перевірки всередині бота. Ключі задаються змінними середовища: URLHAUS_AUTH_KEY, SAFE_BROWSING_API_KEY, VT_API_KEY.',
  'linkscan.chatsSection': 'Які чати перевіряти',
  'linkscan.scopeAll': 'Усі чати',
  'linkscan.scopeSelected': 'Вибрані',
  'linkscan.chatsHint': 'Позначте чати, які потрібно перевіряти.',
  'linkscan.filesHint':
    'Файли: перевіряється будь-який документ до 20 МБ (за контрольною сумою). Файли понад 20 МБ Telegram боту не віддає: якщо тип файлу небезпечний, бот так і напише, що перевірити його не зміг.',
};
