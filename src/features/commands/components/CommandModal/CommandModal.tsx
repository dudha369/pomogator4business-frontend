import { useState } from "react";

import { apiPost } from "@/shared/api/client";
import { BottomSheet } from "@/shared/ui/BottomSheet/BottomSheet";
import { Switch } from "@/shared/ui/Switch";
import { useLocale } from "@/i18n";
import { ApiError } from "@/shared/api/client";
import { createUserAlias, deleteUserAlias } from "../../api";
import type { Command, UserAlias } from "../../types";
import { UserAliasesSection } from "./UserAliasesSection";

import "./commandmodal.css";

interface Props {
  command: Command | null;
  moduleEnabled: boolean;
  onClose: () => void;
  onModuleToggle: (moduleName: string, enabled: boolean) => void;
  userAliases: UserAlias[];
  onUserAliasesChange: (aliases: UserAlias[]) => void;
}

export function CommandModal({
  command,
  moduleEnabled,
  onClose,
  onModuleToggle,
  userAliases,
  onUserAliasesChange,
}: Props) {
  const { t } = useLocale();
  const [toggling, setToggling] = useState(false);

  async function handleToggle(enabled: boolean) {
    if (!command) return;
    setToggling(true);
    onModuleToggle(command.module, enabled);
    try {
      await apiPost("/api/settings/module", { module: command.module, enabled });
    } catch {
      onModuleToggle(command.module, !enabled);
    } finally {
      setToggling(false);
    }
  }

  async function handleAddAlias(alias: string): Promise<string | null> {
    if (!command) return null;
    try {
      const created = await createUserAlias(command.name, alias);
      onUserAliasesChange([...userAliases, created]);
      return null;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) return "commandModal.aliasTaken";
        if (error.status === 400) return "commandModal.aliasInvalid";
      }
      return "commandModal.aliasFailed";
    }
  }

  async function handleRemoveAlias(alias: string) {
    const previous = userAliases;
    onUserAliasesChange(previous.filter((a) => a.alias !== alias));
    try {
      await deleteUserAlias(alias);
    } catch {
      onUserAliasesChange(previous);
    }
  }

  return (
    <BottomSheet open={command !== null} onClose={onClose}>
      {command && (
        <div className="command-modal">
          <div className="command-modal__header">
            <div className="command-modal__badge">{command.name.charAt(0).toUpperCase()}</div>
            <div className="command-modal__heading">
              <h2 className="command-modal__title">{command.title || command.name}</h2>
              <div className="command-modal__triggers">
                <span className="command-modal__trigger">.{command.name}</span>
                {command.aliases.map((alias) => (
                  <span className="command-modal__alias" key={alias}>
                    .{alias}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="command-modal__row">
            <span className="command-modal__row-label">{t("commandModal.enabled")}</span>
            <Switch checked={moduleEnabled} disabled={toggling} onChange={handleToggle} />
          </div>

          {command.long_description && (
            <section className="command-modal__section">
              <h3 className="command-modal__section-title">{t("commandModal.about")}</h3>
              <p className="command-modal__text">{command.long_description}</p>
            </section>
          )}

          {command.usage && (
            <section className="command-modal__section">
              <h3 className="command-modal__section-title">{t("commandModal.usage")}</h3>
              <code className="command-modal__usage">{command.usage}</code>
            </section>
          )}

          {command.scope !== "chat" && (
            <p className="mt-4 rounded-xl border border-line bg-card px-3 py-2 text-sm text-fg">
              {command.scope === "bot"
                ? t("commandModal.dmOnly", { name: command.name })
                : t("commandModal.dmToo", { name: command.name })}
            </p>
          )}

          <UserAliasesSection
            aliases={userAliases.filter((a) => a.command === command.name)}
            onAdd={handleAddAlias}
            onRemove={handleRemoveAlias}
          />

          {command.owner_only && (
            <p className="command-modal__hint">{t("commandModal.ownerOnly")}</p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
