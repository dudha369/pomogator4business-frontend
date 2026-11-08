import { useEffect, useRef, useState } from 'react';

import { useLocale } from '@/i18n';
import { BottomSheet } from '@/shared/ui/BottomSheet/BottomSheet';
import { Switch } from '@/shared/ui/Switch';
import { fetchArchivePrefs, saveArchivePrefs } from '../api';
import { KindIcon } from '../kindIcons';
import type {
  AlbumStyle,
  ArchiveMediaType,
  ArchivePrefs,
  ArchivePrefsResponse,
} from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

type BooleanKey = {
  [K in keyof ArchivePrefs]: ArchivePrefs[K] extends boolean ? K : never;
}[keyof ArchivePrefs];

function Row({
               title,
               hint,
               checked,
               onChange,
               disabled,
             }: {
  title: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2 ${disabled ? 'opacity-40' : ''}`}
    >
      <div className="min-w-0">
        <p className="text-fg">{title}</p>
        <p className="text-hint text-sm">{hint}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onChange={onChange} />
    </div>
  );
}

function Title({ children }: { children: string }) {
  return (
    <h3 className="text-hint mt-4 mb-1 text-xs font-semibold tracking-wide uppercase">
      {children}
    </h3>
  );
}

/** Выбор оформления уведомлений архива: каждое изменение сразу уходит на бэкенд,
 * бот подхватывает его со следующего уведомления. */
export function ArchiveSettingsSheet({ open, onClose }: Props) {
  const { t } = useLocale();
  const [data, setData] = useState<ArchivePrefsResponse | null>(null);
  const [failed, setFailed] = useState(false);
  // номер последнего запроса: ответы на более ранние уже не актуальны
  const lastRequest = useRef(0);

  useEffect(() => {
    if (!open || data) return;
    fetchArchivePrefs()
    .then(setData)
    .catch(() => setFailed(true));
  }, [open, data]);

  const prefs = data?.prefs;

  const update = (patch: Partial<ArchivePrefs>) => {
    if (!data) return;
    const request = ++lastRequest.current;
    setData({ ...data, prefs: { ...data.prefs, ...patch } }); // сразу показываем
    saveArchivePrefs(patch)
    .then((saved) => {
      // ответ на старый запрос не должен перебить более свежие переключатели
      if (request === lastRequest.current) setData(saved);
    })
    .catch(() => {
      // не сохранилось — возвращаем то, что реально хранится на сервере
      if (request !== lastRequest.current) return;
      fetchArchivePrefs()
      .then(setData)
      .catch(() => setFailed(true));
    });
  };

  const toggle = (key: BooleanKey) => (value: boolean) =>
    update({ [key]: value });

  const toggleKind = (kind: ArchiveMediaType) => {
    if (!prefs) return;
    const next = prefs.rich_kinds.includes(kind)
      ? prefs.rich_kinds.filter((k) => k !== kind)
      : [...prefs.rich_kinds, kind];
    update({ rich_kinds: next });
  };

  return (
    <BottomSheet onClose={onClose} open={open}>
      <div className="px-4 pt-2 pb-6">
        <h2 className="text-fg text-lg font-semibold">
          {t('archive.settings.title')}
        </h2>
        <p className="text-hint text-sm">{t('archive.settings.subtitle')}</p>

        {failed && (
          <p className="text-destructive py-4">{t('archive.error')}</p>
        )}
        {!prefs && !failed && (
          <p className="text-hint py-4">{t('archive.loading')}</p>
        )}

        {prefs && data && (
          <>
            <Row
              checked={prefs.rich}
              hint={t('archive.settings.richHint')}
              onChange={toggle('rich')}
              title={t('archive.settings.rich')}
            />

            <Title>{t('archive.settings.albumStyle')}</Title>
            <div className="grid grid-cols-3 gap-2">
              {data.options.album_style.map((style: AlbumStyle) => (
                <button
                  className={`rounded-xl px-2 py-2 text-sm ${
                    prefs.album_style === style
                      ? 'bg-accent text-on-accent'
                      : 'bg-secondary text-fg'
                  } ${prefs.rich ? '' : 'opacity-40'}`}
                  disabled={!prefs.rich}
                  key={style}
                  onClick={() => update({ album_style: style })}
                  type="button"
                >
                  {t(`archive.settings.style.${style}`)}
                </button>
              ))}
            </div>

            <Title>{t('archive.settings.kinds')}</Title>
            <div className="flex flex-wrap gap-2">
              {data.options.rich_kinds.map((kind) => {
                const active = prefs.rich_kinds.includes(kind);
                return (
                  <button
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
                      active
                        ? 'bg-accent text-on-accent'
                        : 'bg-secondary text-fg'
                    } ${prefs.rich ? '' : 'opacity-40'}`}
                    disabled={!prefs.rich}
                    key={kind}
                    onClick={() => toggleKind(kind)}
                    type="button"
                  >
                    <KindIcon className="size-4" kind={kind} />
                    {t(`archive.kind.${kind}`)}
                  </button>
                );
              })}
            </div>
            <p className="text-hint mt-1 text-xs">
              {t('archive.settings.kindsHint')}
            </p>

            <Title>{t('archive.settings.details')}</Title>
            <Row
              checked={prefs.collapse_media}
              disabled={!prefs.rich}
              hint={t('archive.settings.collapseHint')}
              onChange={toggle('collapse_media')}
              title={t('archive.settings.collapse')}
            />
            <Row
              checked={prefs.edit_history}
              hint={t('archive.settings.historyHint')}
              onChange={toggle('edit_history')}
              title={t('archive.settings.history')}
              disabled={!prefs.rich}
            />
            <Row
              checked={prefs.caption_edit_media}
              disabled={!prefs.rich}
              hint={t('archive.settings.captionMediaHint')}
              onChange={toggle('caption_edit_media')}
              title={t('archive.settings.captionMedia')}
            />
            <Row
              checked={prefs.location_map}
              disabled={!prefs.rich}
              hint={t('archive.settings.mapHint')}
              onChange={toggle('location_map')}
              title={t('archive.settings.map')}
            />

            <Title>{t('archive.settings.voice')}</Title>
            <Row
              checked={prefs.voice_transcript}
              hint={t('archive.settings.transcriptHint')}
              onChange={toggle('voice_transcript')}
              title={t('archive.settings.transcript')}
            />
          </>
        )}
      </div>
    </BottomSheet>
  );
}