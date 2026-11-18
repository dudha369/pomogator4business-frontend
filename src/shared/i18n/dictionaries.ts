import type { LocaleCode } from '@/shared/i18n/types';
import * as common from '@/shared/i18n/common';
import * as account from '@/features/account/locales/account';
import * as alerts from '@/features/alerts/locales/alerts';
import * as archive from '@/features/archive/locales/archive';
import * as chats from '@/features/chats/locales/chats';
import * as commands from '@/features/commands/locales/commands';
import * as home from '@/features/home/locales/home';
import * as ping from '@/features/ping/locales/ping';
import * as settings from '@/features/settings/locales/settings';

// Явный реестр вместо import.meta.glob: типы ключей выводятся из RU-словарей,
// а EN/UK каждого файла объявлены как Record<keyof typeof RU, string> —
// пропущенный или лишний ключ в любом языке ломает `tsc`.
const ru = {
  ...common.RU,
  ...account.RU,
  ...alerts.RU,
  ...archive.RU,
  ...chats.RU,
  ...commands.RU,
  ...home.RU,
  ...ping.RU,
  ...settings.RU,
};

export type TranslationKey = keyof typeof ru;

/** Ключи, которые собираются из данных сервера (права бизнес-бота). */
export type TranslateKey = TranslationKey | `rights.${string}`;

type Dict = Record<TranslationKey, string>;

export const TRANSLATIONS: Record<LocaleCode, Dict> = {
  ru,
  en: {
    ...common.EN,
    ...account.EN,
    ...alerts.EN,
    ...archive.EN,
    ...chats.EN,
    ...commands.EN,
    ...home.EN,
    ...ping.EN,
    ...settings.EN,
  },
  uk: {
    ...common.UK,
    ...account.UK,
    ...alerts.UK,
    ...archive.UK,
    ...chats.UK,
    ...commands.UK,
    ...home.UK,
    ...ping.UK,
    ...settings.UK,
  },
};
