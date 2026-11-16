import Link from 'next/link';

/** "leafpress" wordmark: "leaf" in light gray, "press" in olive green, a sprout over the f. */
export default function Logo({ small = false }: { small?: boolean }) {
  return (
    <Link
      href="/"
      className={`relative inline-block font-display font-bold leading-none tracking-tight no-underline ${small ? 'text-[26px]' : 'text-[30px] sm:text-[40px]'}`}
      aria-label="leafpress home"
    >
      <span className="text-[#cfcfcf] [text-shadow:0_2px_3px_rgba(0,0,0,.6)]">lea</span>
      <span className="relative text-[#cfcfcf] [text-shadow:0_2px_3px_rgba(0,0,0,.6)]">
        f
        <svg
          aria-hidden="true"
          viewBox="0 0 40 36"
          className="absolute left-1/2 top-0 h-[0.9em] w-[1em] -translate-x-[40%] -translate-y-[78%]"
        >
          <path
            d="M20 35 C 20 26, 19 20, 20 13"
            stroke="#8fb43f"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
          />
          <path d="M20 16 C 12 16, 5 11, 3 3 C 12 3, 19 7, 20 16Z" fill="#9cc24a" />
          <path d="M20 13 C 26 12, 33 6, 36 0 C 27 0, 21 5, 20 13Z" fill="#c5dc63" />
          <path d="M20 22 C 25 22, 31 19, 33 13 C 27 13, 22 16, 20 22Z" fill="#7fa23a" />
          <path d="M20 16 C 14 14, 9 10, 5 5" stroke="#5c7d26" strokeWidth="0.8" fill="none" />
        </svg>
      </span>
      <span className="text-[#8aa53f] [text-shadow:0_2px_3px_rgba(0,0,0,.6)]">press</span>
    </Link>
  );
}
