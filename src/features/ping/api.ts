import { API_BASE_URL, apiGet } from '@/shared/api/client';

export interface DeepPing {
  telegram_ms: number | null;
  db_ms: number | null;
  uptime_seconds: number;
}

/** Одно измерение: круговое время GET /api/ping в мс. null — сервер недоступен. */
async function pingOnce(): Promise<number | null> {
  const started = performance.now();
  try {
    const response = await fetch(`${API_BASE_URL}/api/ping`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    await response.json();
  } catch {
    return null;
  }
  return performance.now() - started;
}

/** Несколько замеров подряд, берём медиану: первый запрос часто включает DNS/TLS. */
export async function measurePing(samples = 3): Promise<number | null> {
  const results: number[] = [];
  for (let i = 0; i < samples; i++) {
    const value = await pingOnce();
    if (value !== null) results.push(value);
  }
  if (results.length === 0) return null;
  results.sort((a, b) => a - b);
  return Math.round(results[Math.floor(results.length / 2)]);
}

/** Задержки БД и Telegram API на стороне сервера + аптайм (нужна авторизация). */
export function fetchDeepPing(): Promise<DeepPing> {
  return apiGet<DeepPing>('/api/ping/deep');
}
