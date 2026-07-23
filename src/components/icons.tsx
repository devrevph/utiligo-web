type IconProps = { className?: string };

export function BoltMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor" />
    </svg>
  );
}

export function WaterDropIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3s6.5 6.6 6.5 11.2A6.5 6.5 0 0 1 12 20.5a6.5 6.5 0 0 1-6.5-6.3C5.5 9.6 12 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.7 14.3a3.3 3.3 0 0 0 3.3 3.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FlameIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 2.5c.6 2.4-.4 3.9-1.7 5.3-1.6 1.7-3 3.3-3 6a4.7 4.7 0 0 0 9.4 0c0-1.6-.6-2.7-1.4-3.7-.2 1.4-.9 2.1-1.6 2.1-1 0-1.4-.9-1.2-1.9.3-1.6.2-3.6-.5-7.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShirtIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 3.5 12 5l3-1.5 3.5 2.7-2 2.6-1.5-1v9.7a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V7.8l-1.5 1-2-2.6L9 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 7.5h14M9.5 7.5V5.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V7.5M7 7.5l.9 11a1 1 0 0 0 1 .9h6.2a1 1 0 0 0 1-.9l.9-11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10.2 11v5M13.8 11v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function StorefrontIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 9.5 5 4h14l1 5.5M4 9.5a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0M5.5 9.8V20h13V9.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M10 20v-5.5h4V20" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
