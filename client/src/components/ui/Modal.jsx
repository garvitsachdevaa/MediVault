import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    // Lock background scroll while the dialog is open.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-md animate-scale-in rounded-2xl border border-ink-200/70 bg-white p-6 shadow-float"
      >
        <div className="flex items-start justify-between gap-4">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight text-ink-900">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1.5 -mt-1.5 rounded-lg p-1.5 text-ink-400 outline-none transition hover:bg-ink-100 hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-accent-500/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3 text-sm leading-relaxed text-ink-600">{children}</div>
        {footer && (
          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
