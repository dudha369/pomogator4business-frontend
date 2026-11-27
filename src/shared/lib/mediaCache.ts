/** Кэш object URL медиа архива с подсчётом ссылок.
 *
 * Раньше URL жили вечно: каждый просмотренный файл оставался в памяти до
 * закрытия приложения. Теперь URL с живыми потребителями не трогаем, а
 * «простаивающих» держим не больше MAX_IDLE (самые давние отзываем). */

interface Entry {
  refs: number;
  url?: string;
  promise: Promise<string>;
}

const MAX_IDLE = 40;
const entries = new Map<string, Entry>();

function trimIdle(): void {
  const idle = [...entries].filter(([, e]) => e.refs === 0 && e.url);
  for (const [key, entry] of idle.slice(
    0,
    Math.max(0, idle.length - MAX_IDLE),
  )) {
    URL.revokeObjectURL(entry.url!);
    entries.delete(key);
  }
}

export function peekMedia(key: string): string | undefined {
  return entries.get(key)?.url;
}

/** Берёт ссылку на медиа (грузит, если ещё нет). Каждый вызов нужно
 * парой с releaseMedia(key). Одновременные вызовы делят один запрос. */
export function acquireMedia(
  key: string,
  load: () => Promise<Blob>,
): Promise<string> {
  let entry = entries.get(key);
  if (!entry) {
    const created: Entry = {
      refs: 0,
      promise: load().then(
        (blob) => {
          const url = URL.createObjectURL(blob);
          created.url = url;
          return url;
        },
        (error: unknown) => {
          entries.delete(key); // ошибку не кэшируем — следующий заход повторит
          throw error;
        },
      ),
    };
    entries.set(key, created);
    entry = created;
  }
  entry.refs += 1;
  return entry.promise;
}

export function releaseMedia(key: string): void {
  const entry = entries.get(key);
  if (!entry) return;
  entry.refs = Math.max(0, entry.refs - 1);
  if (entry.refs === 0) {
    // переносим в конец Map: порядок вставки = порядок давности (LRU)
    entries.delete(key);
    entries.set(key, entry);
    trimIdle();
  }
}
