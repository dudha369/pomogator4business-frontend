import { apiGet, apiPost } from '@/shared/api/client';
import type { LinkscanState, LinkscanUpdate } from '@/features/linkscan/types';

export const fetchLinkscan = () => apiGet<LinkscanState>('/api/linkscan');

export const updateLinkscan = (update: LinkscanUpdate) =>
  apiPost<LinkscanState>('/api/linkscan', update);
