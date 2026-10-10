import { useEffect, useState } from "react";

import { useLocale } from "@/i18n";
import { Switch } from "@/shared/ui/Switch";
import { readAll } from "../api";
import type { ReadAllRequest, ReadAllResult, ReadMode, ReadUnit } from "../types";

const MODES: ReadMode[] = ["all", "last", "older"];

const FIELD =
  "w-20 rounded-xl border border-line bg-page px-3 py-2 text-fg outline-none focus:border-accent";

function buildRequest(
  mode: ReadMode,
  amount: number,
  unit: ReadUnit,
  excludeFavorites: boolean
): ReadAllRequest {
  const hours = Math.max(1, Math.floor(amount)) * (unit === "d" ? 24 : 1);
  return {
    last_hours: mode === "last" ? hours : undefined,
    older_hours: mode === "older" ? hours : undefined,
    exclude_favorites: excludeFavorites,
  };
}

export function ReadAllPanel() {
  const { t } = useLocale();
  const [mode, setMode] = useState<ReadMode>("all");
  const [amount, setAmount] = useState(6);
  const [unit, setUnit] = useState<ReadUnit>("h");
  const [excludeFavorites, setExcludeFavorites] = useState(false);
  const [matched, setMatched] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ReadAllResult | "error" | null>(null);

  const amountValid = mode === "all" || (Number.isFinite(amount) && amount >= 1);

  // Предпросмотр: сколько чатов подойдёт под фильтр (с дебаунсом)
  useEffect(() => {
    if (!amountValid) {
      setMatched(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      readAll({ ...buildRequest(mode, amount, unit, excludeFavorites), dry_run: true })
        .then((res) => {
          if (!cancelled) setMatched(res.matched);
        })
        .catch(() => {
          if (!cancelled) setMatched(null);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mode, amount, unit, excludeFavorites, amountValid]);

  async function run() {
    setRunning(true);
    setResult(null);
    try {
      setResult(await readAll(buildRequest(mode, amount, unit, excludeFavorites)));
    } catch {
      setResult("error");
    } finally {
      setRunning(false);
    }
  }

  function resultText(): string | null {
    if (result === null) return null;
    if (result === "error" || (result.matched > 0 && result.done === 0)) {
      return t("chats.resultFail");
    }
    if (result.matched === 0) return t("chats.resultNothing");
    if (result.failed > 0) {
      return t("chats.resultPartial", { done: result.done, total: result.matched });
    }
    return t("chats.resultOk", { done: result.done });
  }

  const message = resultText();

  return (
    <section className="mb-5 rounded-2xl border border-line bg-card p-4">
      <h2 className="mb-3 text-base font-semibold text-fg">{t("chats.readTitle")}</h2>

      <div className="mb-3 flex gap-2">
        {MODES.map((m) => (
          <button
            className={`flex-1 rounded-full border px-3 py-1.5 text-sm ${
              mode === m ? "border-accent bg-accent text-white" : "border-line text-fg"
            }`}
            key={m}
            onClick={() => setMode(m)}
            type="button"
          >
            {t(`chats.mode.${m}`)}
          </button>
        ))}
      </div>

      {mode !== "all" && (
        <div className="mb-3 flex items-center gap-2">
          <input
            className={FIELD}
            inputMode="numeric"
            min={1}
            onChange={(e) => setAmount(Number(e.target.value))}
            type="number"
            value={Number.isFinite(amount) ? amount : ""}
          />
          <select
            className="rounded-xl border border-line bg-page px-3 py-2 text-fg outline-none focus:border-accent"
            onChange={(e) => setUnit(e.target.value as ReadUnit)}
            value={unit}
          >
            <option value="h">{t("chats.unitHours")}</option>
            <option value="d">{t("chats.unitDays")}</option>
          </select>
        </div>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-fg">{t("chats.excludeFavorites")}</span>
        <Switch checked={excludeFavorites} onChange={setExcludeFavorites} />
      </div>

      <p className="mb-3 text-sm text-hint">
        {matched === null ? "…" : t("chats.matched", { count: matched })}
      </p>

      <button
        className="w-full rounded-xl bg-accent px-4 py-3 font-medium text-white disabled:opacity-40"
        disabled={running || !amountValid || matched === 0}
        onClick={run}
        type="button"
      >
        {running ? t("chats.reading") : t("chats.readButton")}
      </button>

      {message && <p className="mt-3 text-sm text-fg">{message}</p>}
      <p className="mt-3 text-xs text-hint">{t("chats.hint")}</p>
    </section>
  );
}
