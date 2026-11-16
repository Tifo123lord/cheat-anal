import Image from 'next/image';
import { avatarSvg, svgDataUri } from '@/lib/art';

export default function Avatar({ seed, name, size = 32 }: { seed: number; name: string; size?: number }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  return (
    <Image
      src={svgDataUri(avatarSvg(seed, initials))}
      alt=""
      width={size}
      height={size}
      unoptimized
      className="shrink-0 rounded-full border border-[#8f8770] shadow-[0_1px_2px_rgba(0,0,0,.35)]"
    />
  );
}
