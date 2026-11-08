import { type ReactNode, useState } from 'react';

import type { ArchiveEntity } from '../types';

function Spoiler({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  return (
    <span
      className={`cursor-pointer rounded-sm bg-white/10 transition ${shown ? '' : 'blur-sm select-none'}`}
      onClick={() => setShown(true)}
    >
      {children}
    </span>
  );
}

function wrap(entity: ArchiveEntity, children: ReactNode[], key: string) {
  switch (entity.type) {
    case 'bold':
      return <strong key={key}>{children}</strong>;
    case 'italic':
      return <em key={key}>{children}</em>;
    case 'underline':
      return <u key={key}>{children}</u>;
    case 'strikethrough':
      return <s key={key}>{children}</s>;
    case 'code':
      return (
        <code
          key={key}
          className="rounded bg-white/10 px-1 font-mono text-[0.9em]"
        >
          {children}
        </code>
      );
    case 'pre':
      return (
        <pre
          key={key}
          className="my-1 overflow-x-auto rounded bg-white/10 p-2 font-mono text-[0.9em]"
        >
          {children}
        </pre>
      );
    case 'blockquote':
    case 'expandable_blockquote':
      return (
        <blockquote key={key} className="border-line my-1 border-l-2 pl-2">
          {children}
        </blockquote>
      );
    case 'spoiler':
      return <Spoiler key={key}>{children}</Spoiler>;
    case 'text_link':
      return (
        <a
          key={key}
          className="text-link underline"
          href={entity.url}
          rel="noreferrer"
          target="_blank"
        >
          {children}
        </a>
      );
    default:
      // custom_emoji, mention, hashtag, url…: показываем исходный текст/эмодзи
      return <span key={key}>{children}</span>;
  }
}

function renderRange(
  text: string,
  entities: ArchiveEntity[],
  start: number,
  end: number,
  prefix: string,
): ReactNode[] {
  const sorted = entities
    .filter((e) => e.offset >= start && e.offset + e.length <= end)
    .sort((a, b) => a.offset - b.offset || b.length - a.length);
  const out: ReactNode[] = [];
  let pos = start;
  sorted.forEach((entity, index) => {
    if (entity.offset < pos) return; // вложенная/пересекающаяся — уже отрисована
    if (entity.offset > pos) out.push(text.slice(pos, entity.offset));
    const stop = entity.offset + entity.length;
    const inner = sorted.filter(
      (x) =>
        x !== entity &&
        x.offset >= entity.offset &&
        x.offset + x.length <= stop,
    );
    const key = `${prefix}.${index}`;
    out.push(
      wrap(entity, renderRange(text, inner, entity.offset, stop, key), key),
    );
    pos = stop;
  });
  if (pos < end) out.push(text.slice(pos, end));
  return out;
}

/** Текст с форматированием Telegram (жирный, ссылки, спойлеры, цитаты…). */
export function EntityText({
  text,
  entities,
}: {
  text: string;
  entities: ArchiveEntity[] | null;
}) {
  if (!entities?.length) return <>{text}</>;
  return <>{renderRange(text, entities, 0, text.length, 'e')}</>;
}
