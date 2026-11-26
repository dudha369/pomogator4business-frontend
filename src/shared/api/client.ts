import {
  API_BASE_URL,
  ApiError,
  initDataHeader,
  request,
  requestBlob,
} from '@/shared/api/request';

export { ApiError, API_BASE_URL, initDataHeader };

export const apiGet = <T>(path: string): Promise<T> =>
  request<T>(path).then((res) => res.data);

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, 'POST', body).then((res) => res.data);

export const apiPut = <T>(path: string, body: unknown): Promise<T> =>
  request<T>(path, 'PUT', body).then((res) => res.data);

export const apiDelete = <T>(path: string, body?: unknown): Promise<T> =>
  request<T>(path, 'DELETE', body).then((res) => res.data);

export const apiGetBlob = (path: string): Promise<Blob> => requestBlob(path);
