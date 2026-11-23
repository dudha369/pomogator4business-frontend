export const RU = {
  'userbot.title': 'Юзербот',
  'userbot.link': 'Юзербот',
  'userbot.loading': 'Загрузка…',
  'userbot.error': 'Не удалось загрузить состояние',
  'userbot.actionError': 'Не получилось, попробуйте ещё раз',
  'userbot.intro':
    'Юзербот входит в ваш аккаунт как ещё одно устройство. Он нужен для архива групп и каналов, куда бизнес-бот не заглядывает.',
  'userbot.unavailable.not_configured': 'Юзербот на этом сервере не настроен.',
  'userbot.unavailable.no_encryption':
    'Юзербот недоступен: на сервере не включено шифрование (DATA_MASTER_KEYS). Строку сессии нельзя хранить открытым текстом.',
  'userbot.consentTitle': 'Что нужно знать',
  'userbot.consent1':
    'Сессия даёт полный доступ к аккаунту. На сервере она хранится только в зашифрованном виде, отключить её можно в любой момент.',
  'userbot.consent2':
    'Юзербот читает только выбранные вами чаты и ничего не пишет от вашего имени.',
  'userbot.consent3':
    'Вход по QR, код из SMS не нужен. Пароль облачной двухфакторной защиты, если он есть, проходит через сервер: он не сохраняется и не попадает в логи.',
  'userbot.consent4':
    'В «Настройки → Устройства» появится сеанс «Помогатор»; завершить его можно и оттуда.',
  'userbot.connect': 'Согласен, подключить',
  'userbot.starting': 'Готовим вход…',
  'userbot.qrTitle': 'Отсканируйте QR',
  'userbot.qrHint':
    'На другом устройстве: Telegram → Настройки → Устройства → «Подключить устройство» и наведите камеру. QR обновляется сам.',
  'userbot.qrAlt': 'QR-код для входа в Telegram',
  'userbot.passwordTitle': 'Облачный пароль',
  'userbot.passwordHint':
    'У аккаунта включена двухфакторная защита. Введите пароль: он нужен только для завершения входа.',
  'userbot.passwordPlaceholder': 'Пароль',
  'userbot.passwordSubmit': 'Войти',
  'userbot.error.invalid_password': 'Неверный пароль, попробуйте ещё раз.',
  'userbot.error.too_many_attempts':
    'Слишком много неверных паролей. Начните вход заново.',
  'userbot.error.expired': 'Время входа вышло. Начните заново.',
  'userbot.error.flood':
    'Telegram просит подождать перед новой попыткой. Попробуйте позже.',
  'userbot.error.storage':
    'Не удалось сохранить сессию. Подробности в логах сервера.',
  'userbot.error.failed': 'Вход не удался. Начните заново.',
  'userbot.retry': 'Начать заново',
  'userbot.status.connected': 'Подключён',
  'userbot.status.connecting': 'Подключается…',
  'userbot.status.revoked': 'Сеанс завершён в Telegram. Подключите заново.',
  'userbot.status.removing': 'Отключается…',
  'userbot.connectedHint':
    'Группы и каналы по умолчанию выключены: выбрать, какие архивировать, можно будет на следующем этапе.',
  'userbot.disconnect': 'Отключить и удалить сессию',
  'userbot.disconnectConfirm':
    'Сеанс будет завершён в Telegram, а сохранённая сессия удалена.',
  'userbot.disconnectYes': 'Да, отключить',
  'userbot.cancel': 'Отмена',
};

export const EN: Record<keyof typeof RU, string> = {
  'userbot.title': 'Userbot',
  'userbot.link': 'Userbot',
  'userbot.loading': 'Loading…',
  'userbot.error': 'Could not load the state',
  'userbot.actionError': 'Something went wrong, please try again',
  'userbot.intro':
    'The userbot logs in to your account as one more device. It is used to archive groups and channels that the business bot cannot see.',
  'userbot.unavailable.not_configured':
    'The userbot is not set up on this server.',
  'userbot.unavailable.no_encryption':
    'The userbot is unavailable: encryption (DATA_MASTER_KEYS) is not enabled on the server. The session string cannot be stored as plain text.',
  'userbot.consentTitle': 'What to know',
  'userbot.consent1':
    'The session gives full access to the account. It is stored on the server only encrypted, and you can disconnect it at any time.',
  'userbot.consent2':
    'The userbot reads only the chats you choose and never writes on your behalf.',
  'userbot.consent3':
    'Login is by QR, no SMS code needed. The cloud two-step password, if any, passes through the server: it is not stored and not logged.',
  'userbot.consent4':
    'A "Pomogator" session will appear in Settings → Devices; you can end it from there too.',
  'userbot.connect': 'I agree, connect',
  'userbot.starting': 'Preparing login…',
  'userbot.qrTitle': 'Scan the QR',
  'userbot.qrHint':
    'On another device: Telegram → Settings → Devices → "Link Desktop Device" and point the camera. The QR refreshes by itself.',
  'userbot.qrAlt': 'QR code to log in to Telegram',
  'userbot.passwordTitle': 'Cloud password',
  'userbot.passwordHint':
    'The account has two-step verification. Enter the password: it is only used to finish the login.',
  'userbot.passwordPlaceholder': 'Password',
  'userbot.passwordSubmit': 'Log in',
  'userbot.error.invalid_password': 'Wrong password, please try again.',
  'userbot.error.too_many_attempts':
    'Too many wrong passwords. Start the login again.',
  'userbot.error.expired': 'Login timed out. Start again.',
  'userbot.error.flood':
    'Telegram asks you to wait before another attempt. Try later.',
  'userbot.error.storage':
    'Could not save the session. Details are in the server logs.',
  'userbot.error.failed': 'Login failed. Start again.',
  'userbot.retry': 'Start again',
  'userbot.status.connected': 'Connected',
  'userbot.status.connecting': 'Connecting…',
  'userbot.status.revoked': 'The session was ended in Telegram. Connect again.',
  'userbot.status.removing': 'Disconnecting…',
  'userbot.connectedHint':
    'Groups and channels are off by default: you will be able to choose which ones to archive in the next step.',
  'userbot.disconnect': 'Disconnect and delete session',
  'userbot.disconnectConfirm':
    'The session will be ended in Telegram and the stored session deleted.',
  'userbot.disconnectYes': 'Yes, disconnect',
  'userbot.cancel': 'Cancel',
};

export const UK: Record<keyof typeof RU, string> = {
  'userbot.title': 'Юзербот',
  'userbot.link': 'Юзербот',
  'userbot.loading': 'Завантаження…',
  'userbot.error': 'Не вдалося завантажити стан',
  'userbot.actionError': 'Не вийшло, спробуйте ще раз',
  'userbot.intro':
    'Юзербот входить у ваш акаунт як ще один пристрій. Він потрібен для архіву груп і каналів, куди бізнес-бот не заглядає.',
  'userbot.unavailable.not_configured':
    'Юзербот на цьому сервері не налаштований.',
  'userbot.unavailable.no_encryption':
    'Юзербот недоступний: на сервері не ввімкнено шифрування (DATA_MASTER_KEYS). Рядок сесії не можна зберігати відкритим текстом.',
  'userbot.consentTitle': 'Що потрібно знати',
  'userbot.consent1':
    'Сесія дає повний доступ до акаунта. На сервері вона зберігається лише в зашифрованому вигляді, відключити її можна будь-коли.',
  'userbot.consent2':
    'Юзербот читає лише обрані вами чати й нічого не пише від вашого імені.',
  'userbot.consent3':
    'Вхід за QR, код із SMS не потрібен. Пароль хмарного двоетапного захисту, якщо він є, проходить через сервер: він не зберігається й не потрапляє в логи.',
  'userbot.consent4':
    'У «Налаштування → Пристрої» з’явиться сеанс «Помогатор»; завершити його можна й звідти.',
  'userbot.connect': 'Згоден, підключити',
  'userbot.starting': 'Готуємо вхід…',
  'userbot.qrTitle': 'Скануйте QR',
  'userbot.qrHint':
    'На іншому пристрої: Telegram → Налаштування → Пристрої → «Підключити пристрій» і наведіть камеру. QR оновлюється сам.',
  'userbot.qrAlt': 'QR-код для входу в Telegram',
  'userbot.passwordTitle': 'Хмарний пароль',
  'userbot.passwordHint':
    'В акаунта ввімкнено двоетапний захист. Введіть пароль: він потрібен лише для завершення входу.',
  'userbot.passwordPlaceholder': 'Пароль',
  'userbot.passwordSubmit': 'Увійти',
  'userbot.error.invalid_password': 'Хибний пароль, спробуйте ще раз.',
  'userbot.error.too_many_attempts':
    'Забагато хибних паролів. Почніть вхід заново.',
  'userbot.error.expired': 'Час входу вичерпано. Почніть заново.',
  'userbot.error.flood':
    'Telegram просить зачекати перед новою спробою. Спробуйте пізніше.',
  'userbot.error.storage':
    'Не вдалося зберегти сесію. Подробиці в логах сервера.',
  'userbot.error.failed': 'Вхід не вдався. Почніть заново.',
  'userbot.retry': 'Почати заново',
  'userbot.status.connected': 'Підключений',
  'userbot.status.connecting': 'Підключається…',
  'userbot.status.revoked': 'Сеанс завершено в Telegram. Підключіть знову.',
  'userbot.status.removing': 'Відключається…',
  'userbot.connectedHint':
    'Групи й канали за замовчуванням вимкнені: обрати, які архівувати, можна буде на наступному етапі.',
  'userbot.disconnect': 'Відключити й видалити сесію',
  'userbot.disconnectConfirm':
    'Сеанс буде завершено в Telegram, а збережену сесію видалено.',
  'userbot.disconnectYes': 'Так, відключити',
  'userbot.cancel': 'Скасувати',
};
