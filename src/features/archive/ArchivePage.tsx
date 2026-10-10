import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { useLocale } from "@/i18n";
import { fetchArchivePage } from "./api";
import { ArchiveEntryCard } from "./components/ArchiveEntryCard";
import { ArchiveEntryModal } from "./components/ArchiveEntryModal";
import { ArchiveFiltersBar } from "./components/ArchiveFilters";
import { DEFAULT_ARCHIVE_FILTERS } from "./types";
import type { ArchiveEntry, ArchiveFilters } from "./types";

type LoadState = "loading" | "ready" | "error";

export function ArchivePage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<ArchiveFilters>(() => {
    const chatId = searchParams.get("chat_id");
    return { ...DEFAULT_ARCHIVE_FILTERS, chatId: chatId ? Number(chatId) : null };
  });
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [hasMore, setHasMore] = useState(false);
  const [nextBeforeId, setNextBeforeId] = useState<number | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selected, setSelected] = useState<ArchiveEntry | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Перезагрузка с нуля при смене фильтров (дебаунс 300 мс — чтобы не бить
  // запросом на каждую букву в поиске)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      setState("loading");
      fetchArchivePage(filters)
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
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters]);

  const loadMore = useCallback(async () => {
    if (nextBeforeId === null || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchArchivePage(filters, nextBeforeId);
      setEntries((prev) => [...prev, ...page.entries]);
      setHasMore(page.has_more);
      setNextBeforeId(page.next_before_id);
    } catch {
      // повторится при следующей прокрутке
    } finally {
      setLoadingMore(false);
    }
  }, [filters, nextBeforeId, loadingMore]);

  // Автоподгрузка: невидимый сентинел внизу списка + IntersectionObserver
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (observed) => {
        if (observed[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("archive.title")}</h1>
      </header>

      <ArchiveFiltersBar filters={filters} onChange={setFilters} />

      {state === "loading" && <div className="page__status">{t("archive.loading")}</div>}
      {state === "error" && (
        <div className="page__status page__status--error">{t("archive.error")}</div>
      )}
      {state === "ready" && entries.length === 0 && (
        <div className="page__status">{t("archive.empty")}</div>
      )}

      {state === "ready" && entries.length > 0 && (
        <div className="archive-list">
          {entries.map((entry) => (
            <ArchiveEntryCard entry={entry} key={entry.log_id} onOpen={() => setSelected(entry)} />
          ))}
          {hasMore && <div className="archive-sentinel" ref={sentinelRef} />}
          {loadingMore && <div className="page__status">{t("archive.loadingMore")}</div>}
        </div>
      )}

      <ArchiveEntryModal entry={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
