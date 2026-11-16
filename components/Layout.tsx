import type { ReactNode } from 'react';
import Sidebar from './Sidebar';

/** 930px content column used by every page. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-site px-3 lg:px-0 ${className}`}>{children}</div>;
}

/**
 * Main column (≈630px) + right column (≈280px) on desktop; the right column drops below on tablet
 * and phone. `aside` defaults to the store sidebar.
 */
export function TwoColumn({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="grid grid-cols-1 gap-[14px] lg:grid-cols-[630px_1fr] lg:gap-[18px]">
        <div className="min-w-0">{children}</div>
        <div className="min-w-0">{aside ?? <Sidebar />}</div>
      </div>
    </Container>
  );
}

/** Single cream sheet for content pages. */
export function PaperPage({
  title,
  intro,
  children,
  wide = true,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className={`frame on-paper p-4 sm:p-6 ${wide ? '' : 'mx-auto max-w-[520px]'}`}>
        <h1 className="page-title">{title}</h1>
        {intro && <div className="mt-1 text-[13px] text-ink-muted">{intro}</div>}
        <div className="mt-4">{children}</div>
      </div>
    </Container>
  );
}
