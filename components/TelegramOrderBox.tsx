'use client';

import { useId, useRef, useState } from 'react';
import { telegramOrderText, telegramProfile, TELEGRAM_USERNAME } from '@/lib/telegram';
import type { Order } from '@/lib/types';
import { CheckIcon } from './Icons';
import TelegramIcon from './TelegramIcon';

type OrderLike = Pick<Order, 'id' | 'items' | 'total' | 'email' | 'name'>;

/**
 * Pay-on-Telegram helper: the order message in a read-only box with a copy button, plus a button that
 * opens the plain chat with the seller. Buyers copy the text first and paste it into the chat themselves.
 */
export default function TelegramOrderBox({
  order,
  compact = false,
}: {
  order: OrderLike;
  compact?: boolean;
}) {
  const id = useId();
  const text = telegramOrderText(order);
  const ref = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const fallbackCopy = (): boolean => {
    const el = ref.current;
    if (!el) return false;
    el.focus();
    el.select();
    el.setSelectionRange(0, el.value.length);
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    }
  };

  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) ok = fallbackCopy();
    setFailed(!ok);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className={`rounded-md border border-[#a49b82] bg-paper-light/70 text-ink ${compact ? 'p-2.5' : 'p-3'}`}
      data-testid="telegram-order-box"
    >
      <ol className="space-y-0.5 text-[12px] font-semibold">
        <li>۱. متن سفارش را کپی کن</li>
        <li>۲. روی دکمهٔ تلگرام بزن</li>
        <li>
          ۳. متن را در پیوی <bdi dir="ltr">@{TELEGRAM_USERNAME}</bdi> بفرست و پرداخت کن
        </li>
      </ol>
      <label htmlFor={`${id}-msg`} className="sr-only">
        متن سفارش
      </label>
      <textarea
        id={`${id}-msg`}
        ref={ref}
        readOnly
        dir="rtl"
        value={text}
        rows={Math.min(10, text.split('\n').length + 1)}
        onFocus={(e) => e.currentTarget.select()}
        className="field mt-2 resize-none whitespace-pre-wrap font-sans text-[12.5px] leading-relaxed"
        data-testid="telegram-order-text"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn !py-2 !text-[13px]"
          onClick={() => void copy()}
          aria-live="polite"
        >
          {copied ? (
            <>
              <CheckIcon size={14} /> کپی شد ✓
            </>
          ) : (
            'کپی متن سفارش'
          )}
        </button>
        <a href={telegramProfile()} target="_blank" rel="noopener noreferrer" className="btn-olive !py-2">
          <TelegramIcon size={14} /> باز کردن تلگرام
        </a>
      </div>
      {failed && (
        <p className="error-text" role="alert">
          کپی خودکار انجام نشد؛ متن داخل کادر را انتخاب و دستی کپی کن.
        </p>
      )}
    </div>
  );
}
