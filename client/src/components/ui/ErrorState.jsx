import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-status-danger-border bg-status-danger-bg/60 px-6 py-10 text-center"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs ring-1 ring-status-danger-border">
        <AlertTriangle className="h-5 w-5 text-status-danger" aria-hidden="true" />
      </span>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-700">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
