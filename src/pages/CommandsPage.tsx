import { useEffect, useState } from "react";

import { apiGet } from "../api/client";
import type { Command, CommandsResponse } from "../api/types";
import { CommandCard } from "../components/CommandCard";
import { useLocale } from "../i18n/LocaleContext";

type LoadState = "loading" | "ready" | "error";

export function CommandsPage() {
  const { t, locale } = useLocale();
  const [commands, setCommands] = useState<Command[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    setState("loading");

    apiGet<CommandsResponse>(`/api/commands?locale=${locale}`)
      .then((data) => {
        if (cancelled) return;
        const sorted = [...data.commands].sort((a, b) => a.name.localeCompare(b.name));
        setCommands(sorted);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [locale]);

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("commands.title")}</h1>
        {state === "ready" && <span className="page__count">{commands.length}</span>}
      </header>

      {state === "loading" && <div className="page__status">{t("commands.loading")}</div>}
      {state === "error" && (
        <div className="page__status page__status--error">{t("commands.error")}</div>
      )}

      {state === "ready" && (
        <div className="command-list">
          {commands.map((command) => (
            <CommandCard command={command} key={`${command.module}:${command.name}`} />
          ))}
        </div>
      )}
    </div>
  );
}
