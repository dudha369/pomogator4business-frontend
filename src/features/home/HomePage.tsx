import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useLocale } from "@/i18n";
import { fetchHomeSummary } from "./api";
import type { HomeSummary } from "./types";
import { HomeCounters } from "./components/HomeCounters";
import { HomeQuickToggles } from "./components/HomeQuickToggles";
import { RecentActivityItem } from "./components/RecentActivityItem";

type LoadState = "loading" | "ready" | "error";

export function HomePage() {
  const { t } = useLocale();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;
    fetchHomeSummary()
    .then((data) => {
      if (cancelled) return;
      setSummary(data);
      setState("ready");
    })
    .catch(() => {
      if (!cancelled) setState("error");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return <div className="page__status">{t("home.loading")}</div>;
  }
  if (state === "error" || !summary) {
    return <div className="page__status page__status--error">{t("home.error")}</div>;
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t("home.title")}</h1>
      </header>

      <div
        className={`home-hero ${summary.connected ? "home-hero--connected" : "home-hero--disconnected"}`}
      >
        <div className="home-hero__status-dot" />
        <div className="home-hero__text">
          <p className="home-hero__status-label">
            {summary.connected ? t("home.connected") : t("home.notConnected")}
          </p>
          {summary.connected && summary.ownerName && (
            <p className="home-hero__owner">
              {summary.ownerName}
              {summary.ownerUsername && ` (@${summary.ownerUsername})`}
            </p>
          )}
          {!summary.connected && <p className="home-hero__hint">{t("home.notConnectedHint")}</p>}
        </div>
      </div>

      {summary.stats && <HomeCounters stats={summary.stats} />}

      <HomeQuickToggles
        emojiStatusEnabled={summary.emojiStatusEnabled}
        emojiStatusGranted={summary.emojiStatusGranted}
        mirrorConnected={summary.mirrorConnected}
      />

      <div className="home-stats">
        <div className="home-stat">
          <span className="home-stat__value">
            {summary.modulesEnabled}/{summary.modulesTotal}
          </span>
          <span className="home-stat__label">{t("home.modulesEnabled")}</span>
        </div>
        <div className="home-stat">
          <span className="home-stat__value">{summary.commandsTotal}</span>
          <span className="home-stat__label">{t("home.commandsTotal")}</span>
        </div>
        <div className="home-stat">
          <span className="home-stat__value">{summary.mirrorConnected ? "✓" : "—"}</span>
          <span className="home-stat__label">{t("home.mirror")}</span>
        </div>
        <div className="home-stat">
          <span className="home-stat__value">{summary.emojiStatusEnabled ? "✓" : "—"}</span>
          <span className="home-stat__label">{t("home.emojiStatus")}</span>
        </div>
      </div>

      {summary.recentArchiveEntries.length > 0 && (
        <div className="recent-activity">
          <h2 className="recent-activity__title">{t("home.recentActivity")}</h2>
          {summary.recentArchiveEntries.map((entry) => (
            <RecentActivityItem entry={entry} key={entry.log_id} />
          ))}
          <Link className="recent-activity__view-all" to="/archive">
            {t("home.viewFullArchive")} →
          </Link>
        </div>
      )}
    </div>
  );
}