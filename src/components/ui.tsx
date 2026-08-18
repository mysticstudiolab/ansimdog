import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect } from 'react';
import { CloseIcon } from './icons';

export function Card({ children, style }: PropsWithChildren<{ style?: React.CSSProperties }>) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: PropsWithChildren<{ action?: ReactNode }>) {
  return (
    <div className="section-title-row">
      <h2 className="section-title">{children}</h2>
      {action}
    </div>
  );
}

export function ProgressBar({ percent, tone = 'primary' }: { percent: number; tone?: 'primary' | 'calm' }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`progress-track ${tone === 'calm' ? 'progress-track--calm' : ''}`}>
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function Chip({
  label,
  active,
  tone = 'primary',
  onClick,
  icon,
}: {
  label: string;
  active?: boolean;
  tone?: 'primary' | 'accent' | 'neutral';
  onClick?: () => void;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`chip chip--${tone} ${active ? 'chip--active' : ''}`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

export function IconTile({
  children,
  tone = 'primary',
  size = 44,
}: PropsWithChildren<{ tone?: 'primary' | 'accent' | 'sky' | 'success' | 'neutral' | 'muted'; size?: number }>) {
  return (
    <div className={`icon-tile icon-tile--${tone}`} style={{ width: size, height: size }}>
      {children}
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`segmented-item ${value === opt.value ? 'segmented-item--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'accent' | 'primary' | 'watch' }>) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function EmotionCard({ title, body, tone }: { title: string; body: string; tone: 'celebrate' | 'encourage' | 'calm-alert' }) {
  return (
    <div className={`emotion-card emotion-card--${tone}`}>
      <PawIconMark tone={tone} />
      <div>
        <p className="emotion-title">{title}</p>
        <p className="emotion-body">{body}</p>
      </div>
    </div>
  );
}

function PawIconMark({ tone }: { tone: 'celebrate' | 'encourage' | 'calm-alert' }) {
  const emoji = tone === 'calm-alert' ? '🩺' : tone === 'celebrate' ? '🐾' : '🌤️';
  return <span className="emotion-emoji">{emoji}</span>;
}

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: PropsWithChildren<{ open: boolean; title: string; onClose: () => void }>) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">
          <h3>{title}</h3>
          <button type="button" className="sheet-close" onClick={onClose} aria-label="닫기">
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
  full = true,
}: PropsWithChildren<{ onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; full?: boolean }>) {
  return (
    <button
      type={type}
      className="btn btn-primary"
      style={full ? undefined : { width: 'auto' }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
  full = true,
}: PropsWithChildren<{ onClick?: () => void; disabled?: boolean; full?: boolean }>) {
  return (
    <button
      type="button"
      className="btn btn-secondary"
      style={full ? undefined : { width: 'auto' }}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function FormField({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <label className="form-field">
      <span className="form-label">{label}</span>
      {children}
    </label>
  );
}
