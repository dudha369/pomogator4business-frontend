import type { ReactNode } from "react";

interface Props {
  title?: string;
  children: ReactNode;
}

export function Section({ title, children }: Props) {
  return (
    <section className="section">
      {title && <h2 className="section__title">{title}</h2>}
      <div className="section__body">{children}</div>
    </section>
  );
}
