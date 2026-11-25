import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  fetchArchiveRules,
  fetchUserbotDialogs,
  saveArchiveRule,
} from '@/features/archive/api';
import type {
  ArchiveRule,
  ArchiveRuleBody,
  ArchiveRules,
  DialogKind,
} from '@/features/archive/types';
import { queryKeys } from '@/shared/api/queryKeys';

const PAGE = 50;
const GROUP_KINDS: readonly DialogKind[] = ['group', 'supergroup', 'channel'];

/** Умолчания как на бэкенде (`history.rules.default_rule`): личные чаты бизнес-бота
 * включены, остальное выключено. Строка правила — только отклонение от них. */
export function ruleFor(
  rules: ArchiveRules | undefined,
  chatId: number,
  kind: DialogKind,
): Pick<ArchiveRule, 'enabled' | 'media_enabled' | 'notify'> {
  const row = rules?.rules.find((r) => r.chat_id === chatId);
  if (row) return row;
  return { enabled: kind === 'private', media_enabled: false, notify: true };
}

export const useArchiveRules = () =>
  useQuery({ queryKey: queryKeys.archiveRules, queryFn: fetchArchiveRules });

const MUTATION_KEY = ['archive', 'rule'] as const;

interface Vars {
  chatId: number;
  body: ArchiveRuleBody;
}

function applyLocally(
  prev: ArchiveRules | undefined,
  { chatId, body }: Vars,
): ArchiveRules | undefined {
  if (!prev) return prev;
  const base = ruleFor(prev, chatId, body.kind);
  const next: ArchiveRule = {
    chat_id: chatId,
    kind: body.kind,
    enabled: body.enabled ?? base.enabled,
    media_enabled: body.media_enabled ?? base.media_enabled,
    notify: body.notify ?? base.notify,
  };
  const rules = [...prev.rules.filter((r) => r.chat_id !== chatId), next];
  const groupsUsed = rules.filter(
    (r) => r.enabled && GROUP_KINDS.includes(r.kind),
  ).length;
  return { ...prev, rules, groups_used: groupsUsed };
}

/** Переключатель сразу показывает выбор; отказ (например, лимит тарифа) откатывает.
 * Ответы сервера не пишем в кэш (при быстрых нажатиях они приходят не по порядку):
 * после последнего запроса состояние перечитывается. */
export function useSaveArchiveRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: MUTATION_KEY,
    mutationFn: ({ chatId, body }: Vars) => saveArchiveRule(chatId, body),
    onMutate: async (vars: Vars) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.archiveRules });
      const previous = queryClient.getQueryData<ArchiveRules>(
        queryKeys.archiveRules,
      );
      queryClient.setQueryData<ArchiveRules>(queryKeys.archiveRules, (prev) =>
        applyLocally(prev, vars),
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.archiveRules, context.previous);
      }
    },
    onSettled: () => {
      if (queryClient.isMutating({ mutationKey: MUTATION_KEY }) === 1) {
        return queryClient.invalidateQueries({
          queryKey: queryKeys.archiveRules,
        });
      }
    },
  });
}

/** Диалоги аккаунта живым запросом (бэкенд кэширует их пару минут). 503 — клиент
 * юзербота сейчас не работает: повторы не нужны, экран покажет подсказку. */
export const useUserbotDialogs = (query: string, kind: DialogKind | null) =>
  useInfiniteQuery({
    queryKey: queryKeys.userbotDialogs(query, kind),
    queryFn: ({ pageParam }) =>
      fetchUserbotDialogs(query, kind, pageParam, PAGE),
    initialPageParam: 0,
    getNextPageParam: (last, pages) =>
      last.has_more ? pages.length * PAGE : undefined,
    select: (data) => data.pages.flatMap((page) => page.dialogs),
    retry: false,
    staleTime: 60_000,
  });
