import { Inbox } from 'lucide-react';

export function EmptyState({ icon: Icon = Inbox, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-200 bg-ink-50/40 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-ink-200/70">
        <Icon className="h-6 w-6 text-ink-400" aria-hidden="true" />
      </span>
      {title && <h3 className="mt-4 text-base font-semibold text-ink-900">{title}</h3>}
      {message && <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
