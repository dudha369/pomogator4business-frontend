import { useState } from "react";
import { Link } from "react-router-dom";

import { toggleEmojiStatus } from "@/features/account/api";
import { useLocale } from "@/i18n";
import { Switch } from "@/shared/ui/Switch";

interface Props {
  emojiStatusGranted: boolean;
  emojiStatusEnabled: boolean;
  mirrorConnected: boolean;
}

const ROW = "flex items-center justify-between gap-3 px-4 py-3";

export function HomeQuickToggles({ emojiStatusGranted, emojiStatusEnabled, mirrorConnected }: Props) {
  const { t } = useLocale();
  const [emojiOn, setEmojiOn] = useState(emojiStatusEnabled);
  const [busy, setBusy] = useState(false);

  async function handleEmojiToggle(next: boolean) {
    setEmojiOn(next);
    setBusy(true);
    try {
      setEmojiOn(await toggleEmojiStatus(next));
    } catch {
      setEmojiOn(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
      <div className={ROW}>
        <div className="flex min-w-0 flex-col">
          <span className="text-fg">{t("home.emojiStatus")}</span>
          {!emojiStatusGranted && (
            <Link className="text-xs text-accent" to="/account">
              {t("home.emojiNeedsAccess")}
            </Link>
          )}
        </div>
        <Switch
          checked={emojiStatusGranted && emojiOn}
          disabled={!emojiStatusGranted || busy}
          onChange={handleEmojiToggle}
        />
      </div>

      <Link className={ROW} to="/account">
        <span className="text-fg">{t("home.mirror")}</span>
        <span className={mirrorConnected ? "text-sm text-accent" : "text-sm text-hint"}>
          {mirrorConnected ? t("home.mirrorOn") : t("home.mirrorSetup")} →
        </span>
      </Link>
    </div>
  );
}
