import { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  { className = '', invalid = false, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-accent/40 ${
        invalid ? 'border-status-danger' : 'border-slate-300'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
