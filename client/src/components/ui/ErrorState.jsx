import { AlertCircle } from 'lucide-react';
import { Button } from './Button.jsx';

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-status-danger-bg bg-status-danger-bg/50 p-8 text-center">
      <AlertCircle className="h-8 w-8 text-status-danger" aria-hidden="true" />
      <p className="mt-2 text-sm text-slate-700">{message}</p>
      {onRetry && (
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
