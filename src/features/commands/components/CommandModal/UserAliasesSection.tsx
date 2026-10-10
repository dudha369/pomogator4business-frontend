import { useState } from "react";

import { useLocale } from "@/i18n";
import type { UserAlias } from "../../types";

interface Props {
  aliases: UserAlias[];
  /** Возвращает ключ перевода ошибки или null, если алиас добавлен. */
  onAdd: (alias: string) => Promise<string | null>;
  onRemove: (alias: string) => void;
}

export function UserAliasesSection({ aliases, onAdd, onRemove }: Props) {
  const { t } = useLocale();
  const [value, setValue] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const alias = value.trim();
    if (!alias || busy) return;
    setBusy(true);
    const error = await onAdd(alias);
    setBusy(false);
    setErrorKey(error);
    if (!error) setValue("");
  }

  return (
    <section className="mt-5">
      <h3 className="mb-2 text-sm font-semibold text-hint">{t("commandModal.myAliases")}</h3>

      {aliases.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {aliases.map((item) => (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card py-1 pl-3 pr-2 text-sm text-fg"
              key={item.alias}
            >
              .{item.alias}
              <button
                aria-label={t("commandModal.aliasRemove")}
                className="flex size-5 items-center justify-center rounded-full text-hint active:opacity-60"
                onClick={() => onRemove(item.alias)}
                type="button"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-xl border border-line bg-card px-3 py-2 text-fg outline-none focus:border-accent"
          maxLength={32}
          onChange={(e) => {
            setValue(e.target.value);
            setErrorKey(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={t("commandModal.aliasPlaceholder")}
          value={value}
        />
        <button
          className="rounded-xl bg-accent px-4 py-2 font-medium text-white disabled:opacity-40"
          disabled={busy || value.trim() === ""}
          onClick={submit}
          type="button"
        >
          {t("commandModal.aliasAdd")}
        </button>
      </div>

      {errorKey && <p className="mt-2 text-sm text-red-500">{t(errorKey)}</p>}
      <p className="mt-2 text-xs text-hint">{t("commandModal.aliasHint")}</p>
    </section>
  );
}
