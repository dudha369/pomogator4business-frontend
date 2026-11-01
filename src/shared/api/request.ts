import axios, { type AxiosError } from 'axios';
import { initData, retrieveRawInitData } from '@tma.js/sdk-react';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL ?? ''
).replace(/\/+$/, '');

export const INIT_DATA_HEADER = 'X-Telegram-Init-Data';

export function getInitDataRaw(): string | undefined {
  try {
    const raw = initData.raw();
    if (raw) return raw;
  } catch {}
  try {
    return retrieveRawInitData() || undefined;
  } catch {
    return undefined;
  }
}

export function initDataHeader(): Record<string, string> {
  const raw = getInitDataRaw();
  return raw ? { [INIT_DATA_HEADER]: raw } : {};
}

export class ApiError extends Error {
  readonly status: number | undefined;
  readonly detail: string | undefined;
  readonly reason: string | undefined;
  readonly isNetworkError: boolean;
  readonly isTimeout: boolean;

  constructor(init: {
    status?: number;
    detail?: string;
    reason?: string;
    isNetworkError?: boolean;
    isTimeout?: boolean;
  }) {
    super(
      init.status
        ? `API error ${init.status}${init.detail ? `: ${init.detail}` : ''}`
        : init.isTimeout
          ? 'API timeout'
          : 'Network Error',
    );
    this.name = 'ApiError';
    this.status = init.status;
    this.detail = init.detail;
    this.reason = init.reason;
    this.isNetworkError = init.isNetworkError ?? false;
    this.isTimeout = init.isTimeout ?? false;
  }
}

function parseDetail(data: unknown): { detail?: string; reason?: string } {
  const detail = (data as { detail?: unknown } | null)?.detail;
  if (typeof detail === 'string') return { detail };
  if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
    const reason = (detail as { reason?: unknown }).reason;
    return typeof reason === 'string' ? { reason } : {};
  }
  return {};
}

function toApiError(error: AxiosError): ApiError {
  if (error.response) {
    return new ApiError({
      status: error.response.status,
      ...parseDetail(error.response.data),
    });
  }
  return new ApiError({
    isNetworkError: true,
    isTimeout: error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT',
  });
}

const authEvents = new EventTarget();

export function onUnauthorized(callback: () => void): () => void {
  const handler = () => callback();
  authEvents.addEventListener('unauthorized', handler);
  return () => authEvents.removeEventListener('unauthorized', handler);
}

const http = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const raw = getInitDataRaw();
  if (raw) config.headers.set(INIT_DATA_HEADER, raw);
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const apiError = toApiError(error);
    if (apiError.status === 401) {
      authEvents.dispatchEvent(new Event('unauthorized'));
    }
    return Promise.reject(apiError);
  },
);

interface RequestOptions {
  signal?: AbortSignal;
}

const toUrl = (endpoint: string) => `/${endpoint.replace(/^\/+/, '')}`;

export const request = async <T = unknown>(
  endpoint: string,
  method: Method = 'GET',
  data?: unknown,
  options?: RequestOptions,
): Promise<{ data: T }> => {
  const response = await http.request<T>({
    url: toUrl(endpoint),
    method,
    data,
    signal: options?.signal,
  });
  return { data: response.data };
};

export const requestBlob = async (
  endpoint: string,
  options?: RequestOptions,
): Promise<Blob> => {
  const response = await http.request<Blob>({
    url: toUrl(endpoint),
    method: 'GET',
    responseType: 'blob',
    signal: options?.signal,
  });
  return response.data;
};
