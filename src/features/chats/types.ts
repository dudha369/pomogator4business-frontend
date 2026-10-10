export interface ChatItem {
  chat_id: number;
  last_at: number;
  last_incoming_at: number | null;
  favorite: boolean;
}

export type ReadMode = "all" | "last" | "older";
export type ReadUnit = "h" | "d";

export interface ReadAllRequest {
  last_hours?: number;
  older_hours?: number;
  exclude_favorites: boolean;
  dry_run?: boolean;
}

export interface ReadAllResult {
  matched: number;
  done: number;
  failed: number;
}
