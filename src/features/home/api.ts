import { apiGet } from '@/shared/api/client';
import type { HomeSummary } from '@/features/home/types';

/** Вся главная одним запросом (раньше — шесть). */
export const fetchHome = () => apiGet<HomeSummary>('/api/home');
