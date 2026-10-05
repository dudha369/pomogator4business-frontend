import { useEffect, useState } from "react";

import { useLocale } from "@/i18n";
import { fetchArchivePage } from "./api";
import { ArchiveEntryCard } from "./components/ArchiveEntryCard";
import type { ArchiveEntry } from "./types";

type LoadState = "loading" | "ready" | "error";

export function ArchivePage() {
  const { t } = useLocale();
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [hasMore, setHasMore] = useState(false);
  const [nextBeforeId, setNextBeforeId] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetchArchivePage()
    .then((page) => {
      if (cancelled) return;
      setEntries(page.entries);
      setHasMore(page.has_more);
      setNextBeforeId(page.next_before_id);
      setState("ready");
    })
    .catch(() => {
      if (!cancelled) setState("error");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadMore() {
    if (nextBeforeId === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchArchivePage(nextBeforeId);
      setEntries((prev) => [...prev, ...page.entries]);
      setHasMore(page.has_more);
      setNextBeforeId(page.next_before_id);
    } catch {
      // тихо игнорируем — можно нажать «ещё» повторно
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("archive.title")}</h1>
      </header>

      {state === "loading" && <div className="page__status">{t("archive.loading")}</div>}
      {state === "error" && (
        <div className="page__status page__status--error">{t("archive.error")}</div>
      )}
      {state === "ready" && entries.length === 0 && (
        <div className="page__status">{t("archive.empty")}</div>
      )}

      {state === "ready" && entries.length > 0 && (
        <>
          <div className="archive-list">
            {entries.map((entry) => (
              <ArchiveEntryCard entry={entry} key={entry.log_id} />
            ))}
          </div>
          {hasMore && (
            <button className="archive-load-more" disabled={loadingMore} onClick={loadMore} type="button">
              {loadingMore ? t("archive.loadingMore") : t("archive.loadMore")}
            </button>
          )}
        </>
      )}
    </div>
  );
}