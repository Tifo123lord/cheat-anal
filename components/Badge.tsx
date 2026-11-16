import type { Badge as BadgeType } from '@/lib/types';

const STYLES: Record<BadgeType, string> = {
  NEW: 'bg-[#2f6d68] text-white border-[#1b4441]',
  BESTSELLER: 'bg-[#e0b040] text-[#2b2a22] border-[#9b7a22]',
  SALE: 'bg-sale text-white border-[#7e2a19]',
  FREE: 'bg-leaf text-[#16200a] border-leaf-dark',
};

export default function Badge({ type }: { type: BadgeType }) {
  return (
    <span
      className={`inline-block rounded-sm border px-1.5 py-[1px] text-[9px] font-extrabold tracking-wider shadow-[0_1px_2px_rgba(0,0,0,.4)] ${STYLES[type]}`}
    >
      {type}
    </span>
  );
}
