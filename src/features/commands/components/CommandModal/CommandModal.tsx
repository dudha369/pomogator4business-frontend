import { useState } from "react";

import { apiPost } from "@/shared/api/client";
import { BottomSheet } from "@/shared/ui/BottomSheet/BottomSheet";
import { Switch } from "@/shared/ui/Switch";
import { useLocale } from "@/i18n";
import type { Command } from "../../types";

import "./commandmodal.css";

interface Props {
  command: Command | null;
  moduleEnabled: boolean;
  onClose: () => void;
  onModuleToggle: (moduleName: string, enabled: boolean) => void;
}

export function CommandModal({ command, moduleEnabled, onClose, onModuleToggle }: Props) {
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

          {command.owner_only && (
            <p className="command-modal__hint">{t("commandModal.ownerOnly")}</p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
