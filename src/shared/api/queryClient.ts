import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './request';

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.isNetworkError) return failureCount < 2;
    if (error.reason === 'maintenance_mode') return false;
    const status = error.status ?? 0;
    if (status === 408 || status === 429 || status >= 500) {
      return failureCount < 2;
    }
    return false;
  }
  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: { retry: false },
  },
});
