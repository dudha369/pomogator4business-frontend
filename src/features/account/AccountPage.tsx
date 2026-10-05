import { useEffect, useState } from "react";
import { postEvent, requestEmojiStatusAccess } from "@tma.js/sdk-react";

import { Section } from "@/shared/ui/Section";
import { Switch } from "@/shared/ui/Switch";
import { useLocale } from "@/i18n";
import { fetchAccount, toggleEmojiStatus as apiToggleEmojiStatus, updateTimezone } from "./api";
import {
  TIMEZONE_OPTIONS,
  closestTimezoneOption,
  detectBrowserOffsetMinutes,
  markTimezoneAutoApplied,
  shouldAutoApplyTimezone,
  timezoneLabel,
} from "./timezone";
import type { AccountResponse } from "./types";

type LoadState = "loading" | "ready" | "error";

export function AccountPage() {
  const { t, locale } = useLocale();
  const [state, setState] = useState<LoadState>("loading");
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);
  const [savingTimezone, setSavingTimezone] = useState(false);

  function load() {
    fetchAccount()
    .then((data) => {
      setAccount(data);
      setState("ready");
      maybeAutoApplyTimezone(data);
    })
    .catch(() => setState("error"));
  }

  function maybeAutoApplyTimezone(data: AccountResponse) {
    if (!shouldAutoApplyTimezone()) return;
    const detected = closestTimezoneOption(detectBrowserOffsetMinutes()).offsetMinutes;
    markTimezoneAutoApplied();
    if (detected === data.timezone_offset_minutes) return;
    updateTimezone(detected)
    .then((offset) => {
      setAccount((prev) => (prev ? { ...prev, timezone_offset_minutes: offset } : prev));
    })
    .catch(() => {});
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
      } else {
        setAccessMessage(t("account.accessDenied"));
      }
    } catch {
      setAccessMessage(t("account.unsupported"));
    } finally {
      setRequesting(false);
    }
  }

  async function handleToggleEmojiStatus(enabled: boolean) {
    if (!account) return;
    setAccount({ ...account, emoji_status: { ...account.emoji_status, enabled } });
    try {
      await apiToggleEmojiStatus(enabled);
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
      await updateTimezone(offsetMinutes);
    } catch {
      setAccount((prev) => (prev ? { ...prev, timezone_offset_minutes: previous } : prev));
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
          <>
            <div className="info-row">
              <span className="info-row__label">{t("account.emojiEnabled")}</span>
              <Switch checked={account.emoji_status.enabled} onChange={handleToggleEmojiStatus} />
            </div>
            <p className="section__hint">{t("account.emojiExample")}</p>
            <p className="section__hint">{t("account.emojiDisableNote")}</p>
          </>
        ) : (
          <>
            <p className="section__hint">{t("account.emojiHint")}</p>
            <p className="section__hint">{t("account.emojiExample")}</p>
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