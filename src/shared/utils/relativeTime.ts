/** "5 минут назад" / "2 часа назад" и т.д. — встроенный Intl.RelativeTimeFormat,
 * библиотека не нужна, формат уже локализован под переданный locale. */
export function formatRelativeTime(unixSeconds: number, locale: string): string {
  const diffMs = unixSeconds * 1000 - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}