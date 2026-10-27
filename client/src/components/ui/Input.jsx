import { forwardRef } from 'react';
import { cn } from '../../lib/cn.js';

export const Input = forwardRef(function Input({ className = '', invalid = false, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'h-11 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-900 shadow-xs outline-none transition placeholder:text-ink-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400',
        invalid
          ? 'border-status-danger focus:border-status-danger focus:ring-status-danger/15'
          : 'border-ink-200 hover:border-ink-300 focus:border-accent-500 focus:ring-accent-500/15',
        className
      )}
      {...props}
    />
  );
});
