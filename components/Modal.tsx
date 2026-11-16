'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { CloseIcon } from './Icons';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: 'center' | 'sheet' | 'drawer';
  wide?: boolean;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/** Accessible dialog: focus trap, Escape to close, scroll lock, focus returned to the opener. */
export default function Modal({ open, onClose, title, children, variant = 'center', wide = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const node = ref.current;
    const first =
      node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const panel =
    variant === 'sheet'
      ? 'sheet-enter fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-xl'
      : variant === 'drawer'
        ? 'drawer-enter fixed inset-y-0 left-0 w-[86%] max-w-[320px] overflow-y-auto rounded-r-xl'
        : `fade-in relative mx-auto my-[6vh] max-h-[88vh] w-[calc(100%-24px)] overflow-y-auto rounded-lg ${wide ? 'max-w-[820px]' : 'max-w-[640px]'}`;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`frame on-paper ${panel} p-4`}
      >
        <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#b3aa91] pb-2">
          <h2 className="font-display text-[17px] font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink hover:bg-paper-dark"
            aria-label="Close"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
