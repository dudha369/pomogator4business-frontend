export const RU = {
  'alerts.title': 'Проблемы и настройки',
  'alerts.link': 'Проблемы и настройки',
  'alerts.loading': 'Загрузка…',
  'alerts.error': 'Не удалось загрузить предупреждения',
  'alerts.empty': 'Проблем нет',
  'alerts.mutedTitle': 'Отключённые предупреждения',
  'alerts.mutedHint':
    'Эти предупреждения вы отключили кнопкой «Больше не показывать».',
  'alerts.dismiss': 'Понятно',
  'alerts.mute': 'Больше не показывать',
  'alerts.unmute': 'Показывать снова',
  'alerts.count': 'Повторов: {n}',
  'alerts.last': 'Последний раз: {time}',
  'alerts.unknown': 'Неизвестное предупреждение ({code})',
  'alert.command_failed.title': 'Команда .{name} не выполнилась',
  'alert.command_failed.text':
    'Попробуйте ещё раз. Подробности в логах сервера.',
  'alert.no_delete_right.title': 'Нет права удалять чужие сообщения',
  'alert.no_delete_right.text':
    'Игра с {name} приходит ответом на команду, потому что у бота нет права «Удалять все сообщения». Выдайте его: Настройки Telegram → Telegram для бизнеса → Чат-боты.',
  'alert.mirror_not_running.title': 'Зеркало не запущено',
  'alert.mirror_not_running.text':
    'Бот-зеркало подключён, но не запустился (код: {reason}). Переподключите его в Настройках.',
  'alert.emoji_access_revoked.title': 'Доступ к эмодзи-статусу отозван',
  'alert.emoji_access_revoked.text':
    'Часы в статусе выключены. Включить заново можно в разделе «Аккаунт».',
  'alert.ai_no_key.title': 'ИИ-ответы не работают: нет ключа',
  'alert.ai_no_key.text':
    'ИИ включён, но на сервере не задан AI_API_KEY, поэтому бот не отвечает через ИИ. Задайте ключ или выключите ИИ.',
  'alert.dangerous_link.title': '{headline} от {sender}',
  'alert.dangerous_link.text':
    'Показано как: {display}\nАдрес: {url}\nВердикт: {verdict}',
  'alert.dangerous_file.title': '{headline} от {sender}',
  'alert.dangerous_file.text':
    'Файл: {name}\nSHA-256: {sha}\nВердикт: {verdict}',
  'alert.file_unchecked.title': 'Файл не проверен ({sender})',
  'alert.file_unchecked.text':
    'Файл: {name}, {size} МБ\nTelegram не отдаёт боту файлы больше 20 МБ, поэтому проверить содержимое не удалось. Тип файла: {verdict}',
};

export const EN: Record<keyof typeof RU, string> = {
  'alerts.title': 'Problems and settings',
  'alerts.link': 'Problems and settings',
  'alerts.loading': 'Loading…',
  'alerts.error': 'Could not load warnings',
  'alerts.empty': 'No problems',
  'alerts.mutedTitle': 'Muted warnings',
  'alerts.mutedHint': 'You muted these with "Don\'t show again".',
  'alerts.dismiss': 'Got it',
  'alerts.mute': "Don't show again",
  'alerts.unmute': 'Show again',
  'alerts.count': 'Occurrences: {n}',
  'alerts.last': 'Last time: {time}',
  'alerts.unknown': 'Unknown warning ({code})',
  'alert.command_failed.title': 'The .{name} command failed',
  'alert.command_failed.text':
    'Please try again. Details are in the server logs.',
  'alert.no_delete_right.title': "No right to delete others' messages",
  'alert.no_delete_right.text':
    'The game with {name} is sent as a reply to the command because the bot lacks the "Delete all messages" right. Grant it: Telegram Settings → Telegram Business → Chatbots.',
  'alert.mirror_not_running.title': 'Mirror is not running',
  'alert.mirror_not_running.text':
    'The mirror bot is connected but failed to start (code: {reason}). Reconnect it in Settings.',
  'alert.emoji_access_revoked.title': 'Emoji status access revoked',
  'alert.emoji_access_revoked.text':
    'The status clock is off. You can turn it on again in Account.',
  'alert.ai_no_key.title': 'AI replies are not working: no key',
  'alert.ai_no_key.text':
    'AI is on, but AI_API_KEY is not set on the server, so the bot cannot reply with AI. Set the key or turn AI off.',
  'alert.dangerous_link.title': '{headline} from {sender}',
  'alert.dangerous_link.text':
    'Shown as: {display}\nAddress: {url}\nVerdict: {verdict}',
  'alert.dangerous_file.title': '{headline} from {sender}',
  'alert.dangerous_file.text':
    'File: {name}\nSHA-256: {sha}\nVerdict: {verdict}',
  'alert.file_unchecked.title': 'File not checked ({sender})',
  'alert.file_unchecked.text':
    'File: {name}, {size} MB\nTelegram does not give bots files larger than 20 MB, so the contents could not be checked. File type: {verdict}',
};

export const UK: Record<keyof typeof RU, string> = {
  'alerts.title': 'Проблеми та налаштування',
  'alerts.link': 'Проблеми та налаштування',
  'alerts.loading': 'Завантаження…',
  'alerts.error': 'Не вдалося завантажити попередження',
  'alerts.empty': 'Проблем немає',
  'alerts.mutedTitle': 'Вимкнені попередження',
  'alerts.mutedHint':
    'Ці попередження вимкнено кнопкою «Більше не показувати».',
  'alerts.dismiss': 'Зрозуміло',
  'alerts.mute': 'Більше не показувати',
  'alerts.unmute': 'Показувати знову',
  'alerts.count': 'Повторів: {n}',
  'alerts.last': 'Останній раз: {time}',
  'alerts.unknown': 'Невідоме попередження ({code})',
  'alert.command_failed.title': 'Команда .{name} не виконалась',
  'alert.command_failed.text': 'Спробуйте ще раз. Подробиці в логах сервера.',
  'alert.no_delete_right.title': 'Немає права видаляти чужі повідомлення',
  'alert.no_delete_right.text':
    'Гра з {name} приходить відповіддю на команду, бо в бота немає права «Видаляти всі повідомлення». Надайте його: Налаштування Telegram → Telegram для бізнесу → Чат-боти.',
  'alert.mirror_not_running.title': 'Дзеркало не запущено',
  'alert.mirror_not_running.text':
    'Бот-дзеркало підключено, але не запустилося (код: {reason}). Перепідключіть його в Налаштуваннях.',
  'alert.emoji_access_revoked.title': 'Доступ до emoji-статусу відкликано',
  'alert.emoji_access_revoked.text':
    'Годинник у статусі вимкнено. Увімкнути знову можна в розділі «Акаунт».',
  'alert.ai_no_key.title': 'ШІ-відповіді не працюють: немає ключа',
  'alert.ai_no_key.text':
    'ШІ увімкнено, але на сервері не задано AI_API_KEY, тому бот не відповідає через ШІ. Задайте ключ або вимкніть ШІ.',
  'alert.dangerous_link.title': '{headline} від {sender}',
  'alert.dangerous_link.text':
    'Показано як: {display}\nАдреса: {url}\nВердикт: {verdict}',
  'alert.dangerous_file.title': '{headline} від {sender}',
  'alert.dangerous_file.text':
    'Файл: {name}\nSHA-256: {sha}\nВердикт: {verdict}',
  'alert.file_unchecked.title': 'Файл не перевірено ({sender})',
  'alert.file_unchecked.text':
    'Файл: {name}, {size} МБ\nTelegram не віддає боту файли понад 20 МБ, тому перевірити вміст не вдалося. Тип файлу: {verdict}',
};
