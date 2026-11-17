import type { Schema } from '@/shared/api/schema';

/** Где команда работает: `chat` — бизнес-чаты, `bot` — личка с ботом, `both` — везде. */
type CommandScope = 'chat' | 'bot' | 'both';

export type Command = Omit<Schema<'CommandInfo'>, 'scope'> & {
  scope: CommandScope;
};

export type UserAlias = Schema<'CommandAlias'>;
