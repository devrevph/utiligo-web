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

export function CheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M5 12.5 9.5 17 19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.08-2.383 1.36-2.383 4.19 0 3.29 2.928 4.46 2.958 4.45z"
      />
    </svg>
  );
}

export function PlayIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M3.609 1.814 13.792 12 3.61 22.186a1.6 1.6 0 0 1-.61-1.26V3.075a1.6 1.6 0 0 1 .609-1.26Zm10.831 10.83 2.807 2.808-9.876 5.686 7.069-8.494Zm3.999-3.999 3.325 1.914a1.6 1.6 0 0 1 0 2.882l-3.325 1.914L15.949 12l2.49-3.355ZM14.44 11.156 7.371 2.662l9.876 5.686-2.807 2.808Z"
      />
    </svg>
  );
}
