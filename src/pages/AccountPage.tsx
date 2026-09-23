import { useEffect, useState } from "react";
import { postEvent, requestEmojiStatusAccess } from "@tma.js/sdk-react";

import { apiGet, apiPost } from "../api/client";
import type { AccountResponse } from "../api/types";
import { Section } from "../components/Section";
import { Switch } from "../components/Switch";
import { useLocale } from "../i18n/LocaleContext";

type LoadState = "loading" | "ready" | "error";

export function AccountPage() {
  const { t } = useLocale();
  const [state, setState] = useState<LoadState>("loading");
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [accessMessage, setAccessMessage] = useState<string | null>(null);

  function load() {
    apiGet<AccountResponse>("/api/account")
      .then((data) => {
        setAccount(data);
        setState("ready");
      })
      .catch(() => setState("error"));
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
          <div className="info-row">
            <span className="info-row__label">{t("account.mirrorConnected")}</span>
            <span className="info-row__value">@{account.mirror.username}</span>
          </div>
        ) : (
          <p className="section__hint">{t("account.mirrorNotConnected")}</p>
        )}
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
