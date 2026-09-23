import { retrieveRawInitData } from "@tma.js/sdk-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function initDataHeader(): Record<string, string> {
  try {
    const raw = retrieveRawInitData();
    return raw ? { "X-Telegram-Init-Data": raw } : {};
  } catch {
    return {};
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...initDataHeader() },
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...initDataHeader(),
    },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}
