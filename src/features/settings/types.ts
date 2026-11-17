import type { Schema } from '@/shared/api/schema';

export type SettingsResponse = Schema<'SettingsOut'>;
/** Подключено в БД ≠ запущено: вебхук зеркала мог не подняться (деплой, сбой). */
export type MirrorStatus = Schema<'MirrorState'>;
