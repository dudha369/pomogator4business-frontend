import type { Command } from "../types";

interface Props {
  command: Command;
  enabled: boolean;
  onOpen: () => void;
}

export function CommandCard({ command, enabled, onOpen }: Props) {
  return (
    <button className="command-card" onClick={onOpen} type="button">
      <div className={`command-card__badge ${enabled ? "" : "command-card__badge--disabled"}`}>
        {command.name.charAt(0).toUpperCase()}
      </div>
      <div className="command-card__body">
        <div className="command-card__header">
          <span className="command-card__trigger">.{command.name}</span>
          {command.aliases.map((alias) => (
            <span className="command-card__alias" key={alias}>
              .{alias}
            </span>
          ))}
          {!enabled && <span className="command-card__disabled-pill">off</span>}
        </div>
        <p className="command-card__description">{command.description}</p>
      </div>
    </button>
  );
}
