import Link from "next/link";

export function Logo({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      className="logo"
      aria-label="Folio home"
      onClick={onNavigate}
    >
      <svg
        width="34"
        height="36"
        viewBox="0 0 34 36"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="22"
          height="28"
          rx="5"
          fill="currentColor"
          opacity=".24"
          transform="rotate(-9 3 5)"
        />
        <rect x="10" y="1" width="23" height="29" rx="5" fill="currentColor" />
        <path
          d="M17 10h10M17 15h7M17 20h4"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span>
        folio<span className="logo-period">.</span>
      </span>
    </Link>
  );
}
