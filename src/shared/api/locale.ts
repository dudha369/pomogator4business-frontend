import type { LocaleCode } from '@/shared/i18n/types';
import { request } from '@/shared/api/request';

export interface LocaleResponse {
  locale: LocaleCode;
}

export const localeApi = {
  get: (signal?: AbortSignal) =>
    request<LocaleResponse>('api/locale', 'GET', undefined, { signal }).then(
      (res) => res.data,
    ),

  update: (locale: LocaleCode) =>
    request<LocaleResponse>('api/locale', 'POST', { locale }).then(
      (res) => res.data,
    ),
};
