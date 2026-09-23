import { useEffect, useState } from "react";

import { apiGet, apiPost } from "../api/client";
import type { ModuleState, SettingsResponse } from "../api/types";
import { Section } from "../components/Section";
import { Switch } from "../components/Switch";
import { useLocale } from "../i18n/LocaleContext";
import { LANGUAGE_NAMES } from "../i18n/translations";
import type { LocaleCode } from "../i18n/translations";

type LoadState = "loading" | "ready" | "error";

export function SettingsPage() {
  const { t, locale, setLocale } = useLocale();
  const [state, setState] = useState<LoadState>("loading");
  const [prefix, setPrefix] = useState(".");
  const [prefixInput, setPrefixInput] = useState(".");
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [savingPrefix, setSavingPrefix] = useState(false);
  const [prefixError, setPrefixError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    apiGet<SettingsResponse>("/api/settings")
      .then((data) => {
        if (cancelled) return;
        setPrefix(data.prefix);
        setPrefixInput(data.prefix);
        setModules(data.modules);
        setState("ready");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function savePrefix() {
    if (prefixInput.length !== 1) {
      setPrefixError(t("settings.prefixError"));
      return;
    }
    setPrefixError(null);
    setSavingPrefix(true);
    try {
      await apiPost<{ prefix: string }>("/api/settings/prefix", { prefix: prefixInput });
      setPrefix(prefixInput);
    } catch {
      setPrefixError(t("settings.prefixSaveError"));
    } finally {
      setSavingPrefix(false);
    }
  }

  async function toggleModule(name: string, enabled: boolean) {
    setModules((prev) => prev.map((m) => (m.name === name ? { ...m, enabled } : m)));
    try {
      await apiPost("/api/settings/module", { module: name, enabled });
    } catch {
      setModules((prev) => prev.map((m) => (m.name === name ? { ...m, enabled: !enabled } : m)));
    }
  }

  if (state === "loading") {
    return <div className="page__status">{t("settings.loading")}</div>;
  }

  if (state === "error") {
    return <div className="page__status page__status--error">{t("settings.error")}</div>;
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("settings.title")}</h1>
      </header>

      <Section title={t("settings.languageSection")}>
        <div className="language-switch">
          {(Object.keys(LANGUAGE_NAMES) as LocaleCode[]).map((code) => (
            <button
              className={`language-switch__item ${locale === code ? "language-switch__item--active" : ""}`}
              key={code}
              onClick={() => setLocale(code)}
              type="button"
            >
              {LANGUAGE_NAMES[code]}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("settings.prefixSection")}>
        <div className="prefix-editor">
          <input
            className="prefix-editor__input"
            maxLength={1}
            onChange={(e) => setPrefixInput(e.target.value)}
            value={prefixInput}
          />
          <button
            className="prefix-editor__save"
            disabled={savingPrefix || prefixInput === prefix}
            onClick={savePrefix}
            type="button"
          >
            {savingPrefix ? t("settings.saving") : t("settings.save")}
          </button>
        </div>
        {prefixError && <p className="prefix-editor__error">{prefixError}</p>}
        <p className="section__hint">{t("settings.prefixHint", { prefix })}</p>
      </Section>

      <Section title={t("settings.modulesSection")}>
        <div className="module-list">
          {modules.map((module) => (
            <div className="module-list__row" key={module.name}>
              <span className="module-list__name">{module.name}</span>
              <Switch
                checked={module.enabled}
                onChange={(checked) => toggleModule(module.name, checked)}
              />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
