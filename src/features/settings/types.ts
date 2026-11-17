export interface MirrorStatus {
  connected: boolean;
  username: string | null;
  /** Подключено в БД, но вебхук мог не подняться (деплой, сбой). */
  running: boolean;
}
