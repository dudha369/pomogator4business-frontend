import type { Command } from "../api/types";

interface Props {
  command: Command;
}

export function CommandCard({ command }: Props) {
  return (
    <div className="command-card">
      <div className="command-card__badge">{command.name.charAt(0).toUpperCase()}</div>
      <div className="command-card__body">
        <div className="command-card__header">
          <span className="command-card__trigger">.{command.name}</span>
          {command.aliases.map((alias) => (
            <span className="command-card__alias" key={alias}>
              .{alias}
            </span>
          ))}
        </div>
        <p className="command-card__description">{command.description}</p>
      </div>
    </div>
  );
}
