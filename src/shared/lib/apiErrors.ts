import type { TranslateFn } from '@/i18n/translate';
import { ApiError } from '../api/request';

export function getApiStatus(error: unknown): number | undefined {
  return error instanceof ApiError ? error.status : undefined;
}

export function getApiReason(error: unknown): string | undefined {
  return error instanceof ApiError ? error.reason : undefined;
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) return error.isNetworkError;
  const message = error instanceof Error ? error.message : '';
  return (
    !navigator.onLine ||
    message.includes('Failed to fetch') ||
    message.includes('Network Error') ||
    message.includes('dynamically imported module')
  );
}

export function resolveErrorMessage(error: unknown, t: TranslateFn): string {
  if (isNetworkError(error)) return t('errors.network.subtitle');
  switch (getApiStatus(error)) {
    case 401:
      return t('errors.session_expired.subtitle');
    case 403:
      return t('errors.access_denied.subtitle');
    default:
      return t('errors.general.subtitle');
  }
}
