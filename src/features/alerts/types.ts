import type { Schema } from '@/shared/api/schema';

export type AlertItem = Schema<'AlertOut'>;

/** Коды, для которых есть тексты (синхронно с app/features/alerts/catalog.py). */
const ALERT_CODES = [
  'command_failed',
  'no_delete_right',
  'mirror_not_running',
  'emoji_access_revoked',
  'ai_no_key',
  'data_key_missing',
  'userbot_disconnected',
  'userbot_session_revoked',
  'dangerous_link',
  'dangerous_file',
  'file_unchecked',
  'limit_reached',
] as const;

export type AlertCode = (typeof ALERT_CODES)[number];

export const isAlertCode = (base: string): base is AlertCode =>
  (ALERT_CODES as readonly string[]).includes(base);
