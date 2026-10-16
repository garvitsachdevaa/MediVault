import { AlertCircle } from 'lucide-react';

export function FormField({ label, htmlFor, error, hint, required = false, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-sm font-medium text-ink-700"
        >
          {label}
          {required && (
            <span className="text-status-danger" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs leading-relaxed text-ink-500">{hint}</p>}
      {error && (
        <p className="flex items-start gap-1 text-xs font-medium text-status-danger">
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
