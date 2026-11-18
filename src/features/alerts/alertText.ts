import type { TranslateFn } from '@/shared/i18n/translate';
import { isAlertCode } from '@/features/alerts/types';

export interface AlertText {
  title: string;
  text: string | null;
}

/** Код `base` или `base:subject` (как на сервере). Тексты — по `base`,
 * `subject` подставляется как {name} (имя команды), если сервер не прислал свой. */
export function alertText(
  code: string,
  details: Record<string, string>,
  t: TranslateFn,
): AlertText {
  const [base, ...rest] = code.split(':');
  if (!isAlertCode(base)) {
    return { title: t('alerts.unknown', { code }), text: null };
  }
  const vars = { name: rest.join(':'), reason: '', ...details };
  return {
    title: t(`alert.${base}.title`, vars),
    text: t(`alert.${base}.text`, vars),
  };
}
