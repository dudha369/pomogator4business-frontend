import { useEffect, useState } from "react";
import { postEvent, requestEmojiStatusAccess } from "@tma.js/sdk-react";

import { apiGet, apiPost } from "../api/client";
import type { AccountResponse } from "../api/types";
import { Section } from "../components/Section";
import { Switch } from "../components/Switch";
import { useLocale } from "../i18n/LocaleContext";
import {
  TIMEZONE_OPTIONS,
  closestTimezoneOption,
  detectBrowserOffsetMinutes,
  markTimezoneAutoApplied,
  shouldAutoApplyTimezone,
  timezoneLabel,
} from "../utils/timezone";

type LoadState = "loading" | "ready" | "error";

export function AccountPage() {
  const { t, locale } = useLocale();
  const [state, setState] = useState<LoadState>("loading");
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);
  const [savingTimezone, setSavingTimezone] = useState(false);
  const [mirrorToken, setMirrorToken] = useState("");
  const [connectingMirror, setConnectingMirror] = useState(false);
  const [mirrorError, setMirrorError] = useState<string | null>(null);

  async function handleMirrorConnect() {
    if (!mirrorToken.trim()) return;
    setConnectingMirror(true);
    setMirrorError(null);
    try {
      const res = await apiPost<{ connected: boolean; username: string }>("/api/mirror/connect", {
        token: mirrorToken.trim(),
      });
      setAccount((prev) =>
        prev ? { ...prev, mirror: { connected: true, username: res.username } } : prev
      );
      setMirrorToken("");
    } catch {
      setMirrorError(t("account.mirrorConnectFailed"));
    } finally {
      setConnectingMirror(false);
    }
  }

  async function handleMirrorDisconnect() {
    await apiPost("/api/mirror/disconnect", {});
    setAccount((prev) => (prev ? { ...prev, mirror: { connected: false, username: null } } : prev));
  }

  function load() {
    apiGet<AccountResponse>("/api/account")
    .then((data) => {
      setAccount(data);
      setState("ready");
      maybeAutoApplyTimezone(data);
    })
    .catch(() => setState("error"));
  }

  // Автоопределение часового пояса по браузеру — один раз на устройство.
  // Если пользователь позже поправит пояс вручную через селектор ниже,
  // это больше не перезатирается — ручной выбор имеет приоритет.
  function maybeAutoApplyTimezone(data: AccountResponse) {
    if (!shouldAutoApplyTimezone()) return;

    const detected = closestTimezoneOption(detectBrowserOffsetMinutes()).offsetMinutes;
    markTimezoneAutoApplied();

    if (detected === data.timezone_offset_minutes) return;

    apiPost<{ offset_minutes: number }>("/api/account/timezone", {
      offset_minutes: detected,
    })
    .then((res) => {
      setAccount((prev) =>
        prev ? { ...prev, timezone_offset_minutes: res.offset_minutes } : prev
      );
    })
    .catch(() => {
      // тихо игнорируем — у пользователя просто останется дефолтное
      // значение с бэкенда (UTC+3), он всегда может поправить вручную
    });
  }

  useEffect(load, []);

  async function handleRequestAccess() {
    setRequesting(true);
    setAccessMessage(null);
    try {
      const status = await requestEmojiStatusAccess({});
      if (status === "allowed") {
        postEvent("web_app_data_send", {
          data: JSON.stringify({ emoji_status_access: true }),
        });
        // Mini App закроется автоматически после postEvent — подтверждение придёт в чат с ботом.
      } else {
        setAccessMessage(t("account.accessDenied"));
      }
    } catch {
      setAccessMessage(t("account.unsupported"));
    } finally {
      setRequesting(false);
    }
  }

  async function toggleEmojiStatus(enabled: boolean) {
    if (!account) return;
    setAccount({ ...account, emoji_status: { ...account.emoji_status, enabled } });
    try {
      await apiPost("/api/settings/emoji-status", { enabled });
    } catch {
      setAccount((prev) =>
        prev ? { ...prev, emoji_status: { ...prev.emoji_status, enabled: !enabled } } : prev
      );
    }
  }

  async function handleTimezoneChange(offsetMinutes: number) {
    if (!account) return;
    const previous = account.timezone_offset_minutes;
    setAccount({ ...account, timezone_offset_minutes: offsetMinutes });
    setSavingTimezone(true);
    try {
      await apiPost("/api/account/timezone", { offset_minutes: offsetMinutes });
    } catch {
      setAccount((prev) =>
        prev ? { ...prev, timezone_offset_minutes: previous } : prev
      );
    } finally {
      setSavingTimezone(false);
    }
  }

  if (state === "loading") {
    return <div className="page__status">{t("account.loading")}</div>;
  }

  if (state === "error" || !account) {
    return <div className="page__status page__status--error">{t("account.error")}</div>;
  }

  const grantedRights = Object.entries(account.connection?.rights ?? {}).filter(
    ([, value]) => value === true
  );

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("account.title")}</h1>
      </header>

      <Section title={t("account.connectionSection")}>
        {account.connection ? (
          <>
            <div className="info-row">
              <span className="info-row__label">{t("account.owner")}</span>
              <span className="info-row__value">
                {account.connection.owner_name}
                {account.connection.owner_username && ` (@${account.connection.owner_username})`}
              </span>
            </div>
            <div className="info-row">
              <span className="info-row__label">{t("account.prefix")}</span>
              <span className="info-row__value">{account.connection.prefix}</span>
            </div>

            {grantedRights.length > 0 ? (
              <div className="rights-list">
                {grantedRights.map(([key]) => (
                  <div className="rights-list__item" key={key}>
                    ✅ {t(`rights.${key}`)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="section__hint">{t("account.rightsEmpty")}</p>
            )}
          </>
        ) : (
          <p className="section__hint">{t("account.notConnected")}</p>
        )}
      </Section>

      <Section title={t("account.mirrorSection")}>
        {account.mirror.connected ? (
          <>
            <div className="info-row">
              <span className="info-row__label">{t("account.mirrorConnected")}</span>
              <span className="info-row__value">@{account.mirror.username}</span>
            </div>
            <button className="prefix-editor__save" onClick={handleMirrorDisconnect} type="button">
              {t("account.mirrorDisconnect")}
            </button>
          </>
        ) : (
          <>
            <p className="section__hint">{t("account.mirrorOnboarding")}</p>
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
                {connectingMirror ? t("account.mirrorConnecting") : t("account.mirrorConnect")}
              </button>
            </div>
            {mirrorError && <p className="prefix-editor__error">{mirrorError}</p>}
          </>
        )}
      </Section>

      <Section title={t("account.timezoneSection")}>
        <select
          className="timezone-select"
          disabled={savingTimezone}
          onChange={(e) => handleTimezoneChange(Number(e.target.value))}
          value={account.timezone_offset_minutes}
        >
          {TIMEZONE_OPTIONS.map((opt) => (
            <option key={opt.offsetMinutes} value={opt.offsetMinutes}>
              {timezoneLabel(opt, locale)}
            </option>
          ))}
        </select>
        <p className="section__hint">{t("account.timezoneHint")}</p>
      </Section>

      <Section title={t("account.emojiSection")}>
        {account.emoji_status.granted ? (
          <div className="info-row">
            <span className="info-row__label">{t("account.emojiEnabled")}</span>
            <Switch checked={account.emoji_status.enabled} onChange={toggleEmojiStatus} />
          </div>
        ) : (
          <>
            <p className="section__hint">{t("account.emojiHint")}</p>
            <p className="section__hint">{t("account.emojiExample")}</p>
            <p className="section__hint">{t("account.emojiDisableNote")}</p>
            <button
              className="prefix-editor__save"
              disabled={requesting}
              onClick={handleRequestAccess}
              type="button"
            >
              {requesting ? t("account.requesting") : t("account.requestAccess")}
            </button>
            {accessMessage && <p className="prefix-editor__error">{accessMessage}</p>}
          </>
        )}
      </Section>
    </div>
  );
}
