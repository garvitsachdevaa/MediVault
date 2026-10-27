import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn.js';

// A premium dashboard tile: a tinted gradient surface with an accent icon chip,
// a muted label, a large display-font value and an optional hint/children slot.
//
// `tone` tints the surface + chip to signal meaning without relying on colour
// alone (labels/icons always present). Self-contained, additive component.
const toneSurface = cva(
  'group relative flex flex-col overflow-hidden rounded-2xl border p-5 shadow-card transition duration-200',
  {
    variants: {
      tone: {
        accent: 'border-accent-200/70 bg-gradient-to-br from-accent-50/90 via-white to-white',
        neutral: 'border-ink-200/70 bg-gradient-to-br from-ink-50/80 via-white to-white',
        positive:
          'border-status-normal-border/70 bg-gradient-to-br from-status-normal-bg/70 via-white to-white',
        warning:
          'border-status-review-border/70 bg-gradient-to-br from-status-review-bg/70 via-white to-white',
      },
      interactive: {
        true: 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/50',
        false: '',
      },
    },
    defaultVariants: { tone: 'accent', interactive: false },
  }
);

const chipTone = {
  accent: 'bg-white text-accent-700 ring-accent-100',
  neutral: 'bg-white text-ink-500 ring-ink-200',
  positive: 'bg-white text-status-normal ring-status-normal-border',
  warning: 'bg-white text-status-review ring-status-review-border',
};

export function StatTile({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  tone = 'accent',
  interactive = false,
  as: Tag = 'div',
  className = '',
  children,
  ...props
}) {
  const MotionTag = Tag;
  return (
    <MotionTag className={cn(toneSurface({ tone, interactive }), className)} {...props}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-accent-200/20 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
      />
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {Icon && (
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-xs ring-1',
              chipTone[tone] || chipTone.accent
            )}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        )}
      </div>
      {(value != null || unit) && (
        <div className="relative mt-3 flex items-baseline gap-1.5">
          <span className="font-display text-3xl font-extrabold tracking-tight text-ink-900">
            {value}
          </span>
          {unit && <span className="text-sm font-medium text-ink-500">{unit}</span>}
        </div>
      )}
      {hint && <p className="relative mt-1 text-sm text-ink-500">{hint}</p>}
      {children && <div className="relative mt-3">{children}</div>}
    </MotionTag>
  );
}
