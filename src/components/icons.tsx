type IconProps = { size?: number };

export function MealIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="mealBowl" x1="6" y1="12" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
      </defs>
      <path d="M6 15c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v4c0 5.2-4.5 9.4-10 9.4S6 24.2 6 19z" fill="url(#mealBowl)" />
      <ellipse cx="16" cy="15" rx="10" ry="2.6" fill="#1b64da" />
      <ellipse cx="12.4" cy="14.2" rx="2.6" ry="1.4" fill="#ffffff" opacity="0.4" />
      <g fill="#eaf2ff" opacity="0.92">
        <ellipse cx="16" cy="22.4" rx="2.5" ry="2" />
        <circle cx="13" cy="19.6" r="1.15" />
        <circle cx="16" cy="18.6" r="1.2" />
        <circle cx="19" cy="19.6" r="1.15" />
      </g>
      <circle cx="11" cy="10.4" r="1.5" fill="#ffb066" />
      <circle cx="15.2" cy="9" r="1.7" fill="#ff9f43" />
      <circle cx="19" cy="10.6" r="1.4" fill="#ffb066" />
    </svg>
  );
}

export function WaterIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="waterDrop" x1="9" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
      </defs>
      <path
        d="M16 3c-4.2 6-8.2 11-8.2 16a8.2 8.2 0 0 0 16.4 0C24.2 14 20.2 9 16 3z"
        fill="url(#waterDrop)"
      />
      <ellipse cx="12.8" cy="18.6" rx="1.9" ry="2.8" fill="#ffffff" opacity="0.45" />
    </svg>
  );
}

export function WalkIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="pawGrad" x1="6" y1="8" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="21.5" rx="7.2" ry="6" fill="url(#pawGrad)" />
      <circle cx="7.4" cy="13.4" r="3" fill="url(#pawGrad)" />
      <circle cx="13" cy="8.6" r="3.15" fill="url(#pawGrad)" />
      <circle cx="19" cy="8.6" r="3.15" fill="url(#pawGrad)" />
      <circle cx="24.6" cy="13.4" r="3" fill="url(#pawGrad)" />
      <ellipse cx="13.4" cy="19.2" rx="2" ry="1.4" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

export function PoopIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="poopSwirl" x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#e8c49a" />
          <stop offset="1" stopColor="#c98b4a" />
        </linearGradient>
      </defs>
      <path
        d="M16 4c-1.2 0-2.1.94-2.1 2.1 0 .6.24 1.14.63 1.53-2.16.6-3.76 2.66-3.76 5.1 0 .74.14 1.44.4 2.06-2.6.7-4.47 3.14-4.47 6 0 3.42 3.2 6.21 7.16 6.21h4.28c3.95 0 7.16-2.79 7.16-6.21 0-2.86-1.87-5.3-4.47-6 .26-.62.4-1.32.4-2.06 0-2.44-1.6-4.5-3.76-5.1.39-.39.63-.93.63-1.53C18.1 4.94 17.2 4 16 4z"
        fill="url(#poopSwirl)"
      />
      <ellipse cx="12.6" cy="10.4" rx="1.6" ry="1" fill="#ffffff" opacity="0.35" />
      <circle cx="12.9" cy="20.2" r="1.25" fill="#5a4632" />
      <circle cx="19.1" cy="20.2" r="1.25" fill="#5a4632" />
      <path d="M13.3 23.2c1 1 1.9 1 2.9 0" stroke="#5a4632" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function MedicineIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="pillBlue" x1="4" y1="10" x2="16" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
        <linearGradient id="pillWhite" x1="16" y1="10" x2="28" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dce6f5" />
        </linearGradient>
      </defs>
      <path d="M9 10h6v12H9a6 6 0 0 1 0-12z" fill="url(#pillBlue)" />
      <path d="M17 10h6a6 6 0 0 1 0 12h-6z" fill="url(#pillWhite)" />
      <rect x="14.6" y="10" width="2.8" height="12" fill="#1b64da" opacity="0.25" />
      <circle cx="12" cy="14.4" r="1.15" fill="#ffffff" opacity="0.65" />
    </svg>
  );
}

export function VaccineIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="vaccineGrad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
      </defs>
      <g transform="rotate(45 16 16)">
        <rect x="9" y="6" width="14" height="6" rx="1.6" fill="url(#vaccineGrad)" />
        <rect x="7" y="12" width="18" height="10" rx="2" fill="url(#vaccineGrad)" />
        <rect x="14.5" y="22" width="3" height="6" rx="1" fill="#1b64da" />
        <rect x="11" y="14.5" width="10" height="1.6" fill="#ffffff" opacity="0.5" />
        <rect x="11" y="17.5" width="10" height="1.6" fill="#ffffff" opacity="0.5" />
      </g>
    </svg>
  );
}

export function DewormingIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="dewormGrad" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
      </defs>
      <path
        d="M16 4.2 26 8.4v7.2c0 6.8-4.3 10.9-10 12.2-5.7-1.3-10-5.4-10-12.2V8.4z"
        fill="url(#dewormGrad)"
      />
      <path
        d="M11 16.2 14.6 19.8 21.3 12.4"
        stroke="#ffffff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function HospitalIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="hospitalGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="24" height="24" rx="7" fill="url(#hospitalGrad)" />
      <rect x="13.8" y="9" width="4.4" height="14" rx="1.6" fill="#ffffff" />
      <rect x="9" y="13.8" width="14" height="4.4" rx="1.6" fill="#ffffff" />
    </svg>
  );
}

export function GroomingIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="groomGrad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
      </defs>
      <path d="M12 20 25 7" stroke="url(#groomGrad)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 20 3 7" stroke="url(#groomGrad)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="9.4" cy="23.2" r="3.4" fill="none" stroke="url(#groomGrad)" strokeWidth="2.4" />
      <circle cx="18.6" cy="23.2" r="3.4" fill="none" stroke="url(#groomGrad)" strokeWidth="2.4" />
    </svg>
  );
}

export function EtcIcon({ size = 26 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="etcGrad" x1="4" y1="4" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#6fa8ff" />
          <stop offset="1" stopColor="#2f6fe0" />
        </linearGradient>
      </defs>
      <path d="M5 6h11.2L28 17.8 16.8 29 5 17.2z" fill="url(#etcGrad)" />
      <circle cx="10.6" cy="11.6" r="2.1" fill="#ffffff" />
    </svg>
  );
}

export function HomeIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.2 3 10.8h2.2v8.4c0 .83.67 1.5 1.5 1.5H10v-5.5a2 2 0 0 1 4 0v5.5h3.3c.83 0 1.5-.67 1.5-1.5v-8.4H21z"
        fill="currentColor"
      />
    </svg>
  );
}

export function WeeklyIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="12" width="4" height="8" rx="1.4" fill="currentColor" />
      <rect x="10" y="7" width="4" height="13" rx="1.4" fill="currentColor" />
      <rect x="16" y="3" width="4" height="17" rx="1.4" fill="currentColor" />
    </svg>
  );
}

export function CalendarIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 5a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3.6H3z" fill="currentColor" />
      <rect x="7.1" y="12.2" width="3" height="3" rx="0.8" fill="currentColor" />
      <rect x="13.9" y="12.2" width="3" height="3" rx="0.8" fill="currentColor" />
    </svg>
  );
}

export function ScheduleIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="3" width="16" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M8 11.3 10.2 13.5 16 7.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <line x1="8" y1="16.8" x2="16" y2="16.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function ProfileIcon({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20.3c-3.9-2.5-7.7-5.5-7.7-9.4a4.6 4.6 0 0 1 7.7-3.3 4.6 4.6 0 0 1 7.7 3.3c0 3.9-3.8 6.9-7.7 9.4z"
        fill="currentColor"
      />
      <circle cx="9.4" cy="10.5" r="0.95" fill="var(--color-bg)" />
      <circle cx="12" cy="9.5" r="1" fill="var(--color-bg)" />
      <circle cx="14.6" cy="10.5" r="0.95" fill="var(--color-bg)" />
      <ellipse cx="12" cy="12.4" rx="1.4" ry="1.1" fill="var(--color-bg)" />
    </svg>
  );
}

export function PawAvatarIcon({ size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="avatarEar" x1="4" y1="8" x2="14" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffc179" />
          <stop offset="1" stopColor="#ff9f43" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="#eaf2ff" />
      <ellipse cx="10.6" cy="15.5" rx="4.6" ry="5.6" fill="url(#avatarEar)" transform="rotate(-18 10.6 15.5)" />
      <ellipse cx="17.5" cy="14" rx="8.4" ry="8" fill="#ffffff" />
      <path d="M15.4 16.2c.6.6.6 1.2 0 1.8" stroke="#1c2536" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <circle cx="22.6" cy="15.8" r="1.7" fill="#1c2536" />
    </svg>
  );
}
