import type { LocaleCode } from '@/i18n/types';
import { request } from './request';

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
