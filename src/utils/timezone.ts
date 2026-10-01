/** Шаг списка — 30 минут, этого достаточно для всех реальных поясов (включая Индию UTC+5:30). */
const STEP_MINUTES = 30;
const MIN_OFFSET = -12 * 60;
const MAX_OFFSET = 14 * 60;

export interface TimezoneOption {
  offsetMinutes: number;
  label: string;
}

function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? "+" : "-";
  const abs = Math.abs(minutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  const minsPart = mins === 0 ? "" : `:${String(mins).padStart(2, "0")}`;
  return `UTC${sign}${hours}${minsPart}`;
}

export function buildTimezoneOptions(): TimezoneOption[] {
  const options: TimezoneOption[] = [];
  for (let m = MIN_OFFSET; m <= MAX_OFFSET; m += STEP_MINUTES) {
    options.push({ offsetMinutes: m, label: formatOffset(m) });
  }
  return options;
}

/** Смещение браузера пользователя в минутах, уже с нужным знаком
 * (getTimezoneOffset() отдаёт его инвертированным: для UTC+3 вернёт -180). */
export function detectBrowserOffsetMinutes(): number {
  return -new Date().getTimezoneOffset();
}

const STORAGE_KEY = "calora_tz_auto_applied";

/** true, если автоопределение ещё ни разу не отправлялось с этого устройства —
 * используем localStorage, а не серверный флаг, чтобы не плодить миграции ради
 * одной метки "применяли или нет" и не трогать ручной выбор пользователя повторно. */
export function shouldAutoApplyTimezone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return false; // приватный режим браузера может блокировать localStorage — тогда просто не автоопределяем
  }
}

export function markTimezoneAutoApplied(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }
}
