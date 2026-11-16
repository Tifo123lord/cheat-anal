import Link from 'next/link';
import { Container } from '@/components/Layout';

export default function NotFound() {
  return (
    <Container className="mt-3 md:mt-[14px]">
      <div className="frame on-paper mx-auto max-w-[620px] p-6 text-center">
        <svg
          viewBox="0 0 240 160"
          className="mx-auto h-auto w-[240px]"
          role="img"
          aria-label="A hand-drawn leaf drifting away from an empty branch"
        >
          <path
            d="M20 130 C 70 120, 110 128, 150 116"
            stroke="#5c5a3c"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M90 124 C 92 112, 98 106, 108 102"
            stroke="#5c5a3c"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="2 5"
          />
          <g transform="translate(170 54) rotate(28)">
            <path
              d="M0 -34 C 26 -18, 26 18, 0 34 C -26 18, -26 -18, 0 -34Z"
              fill="#7fa23a"
              stroke="#4f6a1f"
              strokeWidth="2.5"
            />
            <path d="M0 -30 V 40" stroke="#c9dd86" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M0 -8 L12 -18 M0 6 L-12 -4 M0 18 L12 8"
              stroke="#c9dd86"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
          <path
            d="M122 92 q 10 -14 22 -18 M128 72 q 8 -6 16 -6"
            stroke="#8f8770"
            strokeWidth="1.8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="3 4"
          />
          <text x="34" y="64" fontFamily="Georgia,serif" fontSize="52" fontWeight="bold" fill="#b9b098">
            404
          </text>
        </svg>
        <h1 className="page-title mt-2">This page blew away</h1>
        <p className="mt-1 text-[13px] text-ink">
          The link may be old, or the file was moved to a new branch.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn">
            Back home
          </Link>
          <Link href="/shop/" className="btn-ghost">
            Browse the shop
          </Link>
        </div>
      </div>
    </Container>
  );
}
