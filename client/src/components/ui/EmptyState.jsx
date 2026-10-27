import { Inbox } from 'lucide-react';
import { cn } from '../../lib/cn.js';

// A calm, inviting empty state: a floating icon tile over a soft dotted panel,
// then title / message / optional action. Public API unchanged.
export function EmptyState({ icon: Icon = Inbox, title, message, action, className = '' }) {
  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ink-200 bg-ink-50/50 px-6 py-14 text-center',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-brand-wash" aria-hidden="true" />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-card ring-1 ring-ink-200/70">
        <span className="absolute inset-0 rounded-2xl bg-accent-50/60" aria-hidden="true" />
        <Icon className="relative h-7 w-7 text-accent-600" aria-hidden="true" />
      </span>
      {title && <h3 className="relative mt-5 text-base font-semibold text-ink-900">{title}</h3>}
      {message && (
        <p className="relative mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">{message}</p>
      )}
      {action && <div className="relative mt-6">{action}</div>}
    </div>
  );
}
