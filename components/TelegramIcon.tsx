export default function TelegramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="inline-block align-[-2px]"
    >
      <path d="M21.94 4.6a1 1 0 0 0-1.35-1.1L2.7 10.4a1 1 0 0 0 .06 1.88l4.5 1.43 1.73 5.47a1 1 0 0 0 1.67.4l2.5-2.43 4.47 3.29a1 1 0 0 0 1.57-.6l2.74-15.24ZM9.6 13.1l8.06-6.03-6.5 7.05-.27 2.88-1.29-3.9Z" />
    </svg>
  );
}
