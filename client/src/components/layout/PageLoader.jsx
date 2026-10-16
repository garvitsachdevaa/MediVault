import { Loader2 } from 'lucide-react';

// Full-screen loader shown while the initial auth check runs.
export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50">
      <Loader2 className="h-6 w-6 animate-spin text-accent-600" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
