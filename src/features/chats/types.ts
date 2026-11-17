import type { Schema } from '@/shared/api/schema';

export type ChatItem = Schema<'ChatItem'>;
export type ReadAllRequest = Schema<'ReadAllRequest'>;
/** `running` — задача ещё идёт в фоне; у `dry_run` ключа нет. */
export type ReadAllResult = Schema<'ReadProgress'>;

export type ReadMode = 'all' | 'last' | 'older';
export type ReadUnit = 'h' | 'd';
