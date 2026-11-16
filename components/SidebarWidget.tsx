import type { ReactNode } from 'react';

export default function SidebarWidget({
  title,
  children,
  id,
}: {
  title?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section
      className="border-b border-[#bcb399] px-3 py-3 last:border-b-0"
      aria-labelledby={title && id ? id : undefined}
    >
      {title && (
        <h2 id={id} className="widget-title mb-2">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
