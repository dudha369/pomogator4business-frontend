import type { Schema } from '@/shared/api/schema';

export type LinkscanState = Schema<'LinkscanOut'>;
export type LinkscanUpdate = Schema<'LinkscanUpdate'>;

/** Сервисы из `providers` — порядок и названия для экрана. */
export const PROVIDER_NAMES: Record<string, string> = {
  urlhaus: 'URLhaus',
  safebrowsing: 'Google Safe Browsing',
  virustotal: 'VirusTotal',
};
