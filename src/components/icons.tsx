type IconProps = { size?: number; className?: string };

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HomeIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5.5h4V20h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

export function RecordsIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 3.5h6a1 1 0 0 1 1 1V6H8V4.5a1 1 0 0 1 1-1Z" />
      <path d="M8.5 11h7M8.5 14.5h7M8.5 18h4" />
    </svg>
  );
}

export function AnalysisIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 20V10M10 20V4M16 20v-7M20.5 20H3.5" />
    </svg>
  );
}

export function ManagementIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v3M16 3v3" />
      <path d="M8.5 13.5h.01M12 13.5h.01M15.5 13.5h.01M8.5 17h.01M12 17h.01" />
    </svg>
  );
}

export function ProfileIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" />
    </svg>
  );
}

export function BellIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.4 5.6 1.4 5.6H4.6S6 14 6 10Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function PlusIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function ChevronRightIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CloseIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function CheckIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m5 13 4.5 4.5L19 8" />
    </svg>
  );
}

export function CalendarIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 9.5h16M8 3v3M16 3v3" />
    </svg>
  );
}

export function WalletIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="3.5" y="6" width="17" height="13" rx="2" />
      <path d="M3.5 10h17" />
      <circle cx="16" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EditIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m13.5 8 3 3" />
    </svg>
  );
}

export function LogoutIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M14 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2" />
      <path d="M9 12h11m0 0-3-3m3 3-3 3" />
    </svg>
  );
}

export function InfoIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HelpIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9.6 9.5a2.4 2.4 0 1 1 3.6 2.1c-.8.5-1.2 1-1.2 2" />
      <circle cx="12" cy="16.3" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CameraIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1-2h6l1 2h2.5A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18Z" />
      <circle cx="12" cy="13" r="3.4" />
    </svg>
  );
}

export function SparkleIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} strokeWidth={0} fill="currentColor">
      <path d="M11 3c.6 3 2.2 4.6 5.2 5.2-3 .6-4.6 2.2-5.2 5.2-.6-3-2.2-4.6-5.2-5.2C8.8 7.6 10.4 6 11 3Z" />
      <path d="M17.2 13.5c.4 1.7 1.3 2.6 3 3-1.7.4-2.6 1.3-3 3-.4-1.7-1.3-2.6-3-3 1.7-.4 2.6-1.3 3-3Z" />
    </svg>
  );
}

export function PawIcon({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} strokeWidth={0} fill="currentColor">
      <ellipse cx="12" cy="16" rx="5.4" ry="4.4" />
      <circle cx="5.5" cy="10" r="2.2" />
      <circle cx="9.5" cy="6" r="2.3" />
      <circle cx="14.5" cy="6" r="2.3" />
      <circle cx="18.5" cy="10" r="2.2" />
    </svg>
  );
}

// --- 기록/일정 카테고리 글리프 (IconTile과 함께 원형 배경 위에 사용) ---

export function MealGlyphIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M7 3v6a2 2 0 0 0 2 2v10M7 3v6M9 3v6" />
      <path d="M15 3s-1.5 2-1.5 5 1.5 3.5 1.5 3.5V21" />
    </svg>
  );
}

export function WalkGlyphIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="13.5" cy="4.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M11 8l-1.5 4L7 14.5V21M11 8l3 1 2 3.5-1 3.5 2.5 3M11 8l2.2-1.6L16 8" />
    </svg>
  );
}

export function PoopGlyphIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M12 4c-1 0-1.6.8-1.3 1.7-1.8.6-3 2.3-3 4.2 0 .6.1 1.1.3 1.6-2.1.7-3.5 2.6-3.5 4.8 0 2.8 2.4 4.7 5.4 4.7h4.2c3 0 5.4-1.9 5.4-4.7 0-2.2-1.4-4.1-3.5-4.8.2-.5.3-1 .3-1.6 0-1.9-1.2-3.6-3-4.2C13.6 4.8 13 4 12 4Z" />
    </svg>
  );
}

export function ConditionGlyphIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.5 10.5h.01M15.5 10.5h.01" strokeWidth={2.4} />
      <path d="M8.5 15c1 1 5.5 1 6.5 0" />
    </svg>
  );
}

export function MedicineGlyphIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="4" y="9" width="16" height="7" rx="3.5" transform="rotate(-30 12 12.5)" />
      <path d="m11 9 2 7" transform="rotate(-30 12 12.5)" />
    </svg>
  );
}

export function VaccineGlyphIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="m18.5 5.5-3 3M9 15l6-6 3 3-6 6-3.5.5.5-3.5Z" />
      <path d="m5 19 2.2-2.2" />
    </svg>
  );
}

export function HospitalGlyphIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function GroomingGlyphIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size)} className={className}>
      <path d="M6 6c3 3 3 9 3 9M18 6c-3 3-3 9-3 9" />
      <circle cx="6" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <path d="M6 15c1.5 2 4.5 3 6 3s4.5-1 6-3" />
    </svg>
  );
}
