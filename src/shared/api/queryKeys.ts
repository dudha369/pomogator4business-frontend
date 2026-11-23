/** Ключи react-query в одном месте: мутации одной фичи сбрасывают данные другой
 * (переключили эмодзи-статус в Аккаунте → обновилась Главная). */
export const queryKeys = {
  session: ['session'] as const,
  home: ['home'] as const,
  alerts: ['alerts'] as const,
  linkscan: ['linkscan'] as const,
  userbot: ['userbot'] as const,
  account: ['account'] as const,
  settings: ['settings'] as const,
  mirror: ['mirror'] as const,
  commands: (locale: string) => ['commands', locale] as const,
  aliases: ['aliases'] as const,
  chats: ['chats'] as const,
  readAllStatus: ['readall', 'status'] as const,
  readAllPreview: (request: unknown) =>
    ['readall', 'preview', request] as const,
  archive: (filters: unknown) => ['archive', filters] as const,
  archivePrefs: ['archive', 'prefs'] as const,
  chatInfo: (userId: number) => ['chat-info', userId] as const,
  avatar: (userId: number) => ['avatar', userId] as const,
  ping: ['ping'] as const,
  pingDeep: ['ping', 'deep'] as const,
};
