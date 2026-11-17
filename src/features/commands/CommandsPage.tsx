import { useState } from 'react';

import { useLocale } from '@/shared/i18n';
import { CommandCard } from '@/features/commands/components/CommandCard';
import { CommandModal } from '@/features/commands/components/CommandModal/CommandModal';
import { useCommands } from '@/features/commands/hooks/useCommands';
import { useSettings } from '@/features/settings/hooks/useSettings';
import type { Command } from '@/features/commands/types';

export function CommandsPage() {
  const { t, locale } = useLocale();
  const commands = useCommands(locale);
  const settings = useSettings();
  const [selected, setSelected] = useState<Command | null>(null);

  const isPending = commands.isPending || settings.isPending;
  const isError = commands.isError || settings.isError;
  const list = commands.data ?? [];

  function isModuleEnabled(moduleName: string): boolean {
    return (
      settings.data?.modules.find((m) => m.name === moduleName)?.enabled ?? true
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1>{t('commands.title')}</h1>
        {!isPending && !isError && (
          <span className="page__count">{list.length}</span>
        )}
      </header>

      {isPending && <div className="page__status">{t('commands.loading')}</div>}
      {isError && (
        <div className="page__status page__status--error">
          {t('commands.error')}
        </div>
      )}

      {!isPending && !isError && (
        <div className="command-list">
          {list.map((command) => (
            <CommandCard
              command={command}
              enabled={isModuleEnabled(command.module)}
              key={`${command.module}:${command.name}`}
              onOpen={() => setSelected(command)}
            />
          ))}
        </div>
      )}

      <CommandModal
        command={selected}
        moduleEnabled={selected ? isModuleEnabled(selected.module) : true}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
