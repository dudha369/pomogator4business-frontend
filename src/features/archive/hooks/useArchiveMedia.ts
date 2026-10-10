import { useEffect, useState } from "react";

import { apiGetBlob } from "@/shared/api/client";

type MediaState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error" };

const cache = new Map<number, string>();

/** Медиа архива нельзя положить в <img src> напрямую — нужен заголовок
 * авторизации, поэтому грузим байты через fetch и отдаём object URL. */
export function useArchiveMedia(logId: number): MediaState {
  const [state, setState] = useState<MediaState>(() => {
    const cached = cache.get(logId);
    return cached ? { status: "ready", url: cached } : { status: "loading" };
  });

  useEffect(() => {
    const cached = cache.get(logId);
    if (cached) {
      setState({ status: "ready", url: cached });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    apiGetBlob(`/api/archive/${logId}/media`)
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        cache.set(logId, url);
        if (!cancelled) setState({ status: "ready", url });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [logId]);

  return state;
}
