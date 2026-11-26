import { useState } from 'react';

import { useDeleteArchiveEntries } from '@/features/archive/hooks/useArchive';
import { useLocale } from '@/shared/i18n';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';

interface Props {
  /** выбранные записи (log_id) */
  ids: number[];
  onDone: () => void;
}

type Action = 'delete' | 'files';

/** Нижняя панель режима выбора: удалить записи или только их файлы. Оба действия
 * необратимы, поэтому идут через подтверждение. */
export function ArchiveSelectBar({ ids, onDone }: Props) {
  const { t } = useLocale();
  const [action, setAction] = useState<Action | null>(null);
  const remove = useDeleteArchiveEntries();
  const empty = ids.length === 0;

  const confirm = () => {
    if (!action) return;
    remove.mutate(
      { ids, mediaOnly: action === 'files' },
      {
        onSuccess: () => {
          setAction(null);
          onDone();
        },
      },
    );
  };
  const close = () => {
    if (!remove.isPending) {
      setAction(null);
      remove.reset();
    }
  };

  return (
    <>
      <div className="bg-card sticky bottom-3 z-10 mt-3 flex items-center gap-2 rounded-xl p-3 shadow-lg">
        <span className="text-fg min-w-0 flex-1 truncate text-sm">
          {t('archive.select.count', { count: ids.length })}
        </span>
        <button
          className="text-fg bg-secondary rounded-lg px-3 py-2 text-sm disabled:opacity-40"
          disabled={empty}
          onClick={() => setAction('files')}
          type="button"
        >
          {t('archive.select.files')}
        </button>
        <button
          className="bg-destructive rounded-lg px-3 py-2 text-sm text-white disabled:opacity-40"
          disabled={empty}
          onClick={() => setAction('delete')}
          type="button"
        >
          {t('archive.select.delete')}
        </button>
      </div>

      <BottomSheet onClose={close} open={action !== null}>
        <div className="flex flex-col gap-3 p-4">
          <p className="text-fg">
            {t(
              action === 'files'
                ? 'archive.select.confirmFiles'
                : 'archive.select.confirmDelete',
              { count: ids.length },
            )}
          </p>
          {remove.isError && (
            <p className="text-destructive text-sm">
              {t('archive.select.error')}
            </p>
          )}
          <button
            className="bg-destructive w-full rounded-xl px-4 py-3 font-medium text-white disabled:opacity-40"
            disabled={remove.isPending}
            onClick={confirm}
            type="button"
          >
            {t('archive.select.confirm')}
          </button>
          <button
            className="text-hint w-full px-4 py-2"
            disabled={remove.isPending}
            onClick={close}
            type="button"
          >
            {t('archive.select.cancel')}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
