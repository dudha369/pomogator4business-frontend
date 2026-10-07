import { useEffect, useState } from "react";

import { Section } from "@/shared/ui/Section";
import { LANGUAGE_NAMES, useLocale } from "@/i18n";
import type { LocaleCode } from "@/i18n";
import {
  connectMirror,
  disconnectMirror,
  fetchMirrorStatus,
  fetchPrefix,
  updatePrefix,
} from "./api";
import type { MirrorStatus } from "./types";
import { COLOR_SCHEMES, useColorScheme } from "@/app/providers/ColorSchemeProvider";

type LoadState = "loading" | "ready" | "error";

export function SettingsPage() {
  const { t, locale, setLocale } = useLocale();
  const [state, setState] = useState<LoadState>("loading");
  const [prefix, setPrefix] = useState(".");
  const [prefixInput, setPrefixInput] = useState(".");
  const [savingPrefix, setSavingPrefix] = useState(false);
  const [prefixError, setPrefixError] = useState<string | null>(null);

  const [mirror, setMirror] = useState<MirrorStatus>({ connected: false, username: null });
  const [mirrorToken, setMirrorToken] = useState("");
  const [connectingMirror, setConnectingMirror] = useState(false);
  const [mirrorError, setMirrorError] = useState<string | null>(null);
  const { scheme, setScheme } = useColorScheme();

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPrefix(), fetchMirrorStatus()])
    .then(([prefixRes, mirrorRes]) => {
      if (cancelled) return;
      setPrefix(prefixRes);
      setPrefixInput(prefixRes);
      setMirror(mirrorRes);
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
      setPrefix(await updatePrefix(prefixInput));
    } catch {
      setPrefixError(t("settings.prefixSaveError"));
    } finally {
      setSavingPrefix(false);
    }
  }

  async function handleMirrorConnect() {
    if (!mirrorToken.trim()) return;
    setConnectingMirror(true);
    setMirrorError(null);
    try {
      setMirror(await connectMirror(mirrorToken.trim()));
      setMirrorToken("");
    } catch {
      setMirrorError(t("settings.mirrorConnectFailed"));
    } finally {
      setConnectingMirror(false);
    }
  }

  async function handleMirrorDisconnect() {
    await disconnectMirror();
    setMirror({ connected: false, username: null });
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

      <Section title={t("settings.colorSchemeSection")}>
        <div className="color-scheme-row">
          {COLOR_SCHEMES.map((option) => (
            <button
              aria-label={option.value}
              className={`color-swatch ${scheme === option.value ? "color-swatch--active" : ""}`}
              key={option.value}
              onClick={() => setScheme(option.value)}
              style={{ background: option.swatch }}
              type="button"
            />
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

      <Section title={t("settings.mirrorSection")}>
        {mirror.connected ? (
          <>
            <div className="info-row">
              <span className="info-row__label">{t("settings.mirrorConnected")}</span>
              <span className="info-row__value">@{mirror.username}</span>
            </div>
            <button className="prefix-editor__save" onClick={handleMirrorDisconnect} type="button">
              {t("settings.mirrorDisconnect")}
            </button>
          </>
        ) : (
          <>
            <p className="section__hint">{t("settings.mirrorOnboarding")}</p>
            <div className="prefix-editor">
              <input
                className="prefix-editor__input"
                style={{ width: "auto", flex: 1 }}
                onChange={(e) => setMirrorToken(e.target.value)}
                placeholder="123456:AAAA...xyz"
                value={mirrorToken}
              />
              <button
                className="prefix-editor__save"
                disabled={connectingMirror || !mirrorToken.trim()}
                onClick={handleMirrorConnect}
                type="button"
              >
                {connectingMirror ? t("settings.mirrorConnecting") : t("settings.mirrorConnect")}
              </button>
            </div>
            {mirrorError && <p className="prefix-editor__error">{mirrorError}</p>}
          </>
        )}
      </Section>
    </div>
  );
}