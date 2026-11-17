import { ApiError } from '@/shared/api/client';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';
import { Switch } from '@/shared/ui/Switch';
import { useLocale } from '@/shared/i18n';
import {
  useCreateAlias,
  useDeleteAlias,
  useUserAliases,
} from '@/features/commands/hooks/useCommands';
import { useToggleModule } from '@/features/settings/hooks/useSettings';
import type { TranslationKey } from '@/shared/i18n';
import type { Command } from '@/features/commands/types';
import { UserAliasesSection } from '@/features/commands/components/CommandModal/UserAliasesSection';

import '@/features/commands/components/CommandModal/commandmodal.css';

interface Props {
  command: Command | null;
  moduleEnabled: boolean;
  onClose: () => void;
}

export function CommandModal({ command, moduleEnabled, onClose }: Props) {
  const { t } = useLocale();
  const userAliases = useUserAliases();
  const toggleModule = useToggleModule();
  const createAlias = useCreateAlias();
  const deleteAlias = useDeleteAlias();

  /** Возвращает ключ перевода ошибки или null, если алиас добавлен. */
  async function handleAddAlias(alias: string): Promise<TranslationKey | null> {
    if (!command) return null;
    try {
      await createAlias.mutateAsync({ command: command.name, alias });
      return null;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 409) return 'commandModal.aliasTaken';
        if (error.status === 400) return 'commandModal.aliasInvalid';
      }
      return 'commandModal.aliasFailed';
    }
  }

  return (
    <BottomSheet open={command !== null} onClose={onClose}>
      {command && (
        <div className="command-modal">
          <div className="command-modal__header">
            <div className="command-modal__badge">
              {command.name.charAt(0).toUpperCase()}
            </div>
            <div className="command-modal__heading">
              <h2 className="command-modal__title">
                {command.title || command.name}
              </h2>
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
            <span className="command-modal__row-label">
              {t('commandModal.enabled')}
            </span>
            <Switch
              checked={moduleEnabled}
              disabled={toggleModule.isPending}
              onChange={(enabled) =>
                toggleModule.mutate({ module: command.module, enabled })
              }
            />
          </div>

          {command.long_description && (
            <section className="command-modal__section">
              <h3 className="command-modal__section-title">
                {t('commandModal.about')}
              </h3>
              <p className="command-modal__text">{command.long_description}</p>
            </section>
          )}

          {command.usage && (
            <section className="command-modal__section">
              <h3 className="command-modal__section-title">
                {t('commandModal.usage')}
              </h3>
              <code className="command-modal__usage">{command.usage}</code>
            </section>
          )}

          {command.scope !== 'chat' && (
            <p className="border-line bg-card text-fg mt-4 rounded-xl border px-3 py-2 text-sm">
              {command.scope === 'bot'
                ? t('commandModal.dmOnly', { name: command.name })
                : t('commandModal.dmToo', { name: command.name })}
            </p>
          )}

          <UserAliasesSection
            aliases={userAliases.filter((a) => a.command === command.name)}
            onAdd={handleAddAlias}
            onRemove={(alias) => deleteAlias.mutate(alias)}
          />

          {command.owner_only && (
            <p className="command-modal__hint">{t('commandModal.ownerOnly')}</p>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
