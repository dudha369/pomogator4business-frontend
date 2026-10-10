import { useEffect, useState } from "react";

import { useLocale } from "@/i18n";
import { CommandCard } from "./components/CommandCard";
import { CommandModal } from "./components/CommandModal/CommandModal";
import { fetchCommands, fetchModuleStates, fetchUserAliases } from "./api";
import type { Command, ModuleState, UserAlias } from "./types";

type LoadState = "loading" | "ready" | "error";

export function CommandsPage() {
  const { t, locale } = useLocale();
  const [commands, setCommands] = useState<Command[]>([]);
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [selected, setSelected] = useState<Command | null>(null);
  const [userAliases, setUserAliases] = useState<UserAlias[]>([]);

  useEffect(() => {
    let cancelled = false;
    setState("loading");

    Promise.all([fetchCommands(locale), fetchModuleStates()])
    .then(([commandsRes, modulesRes]) => {
      if (cancelled) return;
      setCommands(commandsRes);
      setModules(modulesRes);
      setState("ready");
    })
    .catch(() => {
      if (!cancelled) setState("error");
    });

    // алиасы — необязательная часть: если запрос упал, список просто пуст
    fetchUserAliases()
    .then((aliases) => {
      if (!cancelled) setUserAliases(aliases);
    })
    .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [locale]);

  function isModuleEnabled(moduleName: string): boolean {
    return modules.find((m) => m.name === moduleName)?.enabled ?? true;
  }

  function handleModuleToggle(moduleName: string, enabled: boolean) {
    setModules((prev) => prev.map((m) => (m.name === moduleName ? { ...m, enabled } : m)));
  }

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
            <CommandCard
              command={command}
              enabled={isModuleEnabled(command.module)}
              key={`${command.module}:${command.name}`}
              onOpen={() => setSelected(command)}
            />
          ))}
        </div>
      )}

      <CommandModal
        command={selected}
        moduleEnabled={selected ? isModuleEnabled(selected.module) : true}
        onClose={() => setSelected(null)}
        onModuleToggle={handleModuleToggle}
        onUserAliasesChange={setUserAliases}
        userAliases={userAliases}
      />
    </div>
  );
}
