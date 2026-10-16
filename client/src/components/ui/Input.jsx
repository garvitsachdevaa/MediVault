import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ className = '', invalid = false, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
        invalid ? 'border-status-danger' : 'border-slate-300'
      } ${className}`}
      {...props}
    />
  );
});
