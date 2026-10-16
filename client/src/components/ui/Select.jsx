import { forwardRef } from 'react';

export const Select = forwardRef(function Select(
  { className = '', invalid = false, children, ...props },
  ref
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={`h-11 w-full appearance-none rounded-xl border bg-white pl-3.5 pr-10 text-sm text-ink-900 shadow-xs outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400 ${
          invalid
            ? 'border-status-danger focus:border-status-danger focus:ring-status-danger/15'
            : 'border-ink-200 hover:border-ink-300 focus:border-accent-500 focus:ring-accent-500/15'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {/* Custom chevron so the control matches our inputs across browsers. */}
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M6 8l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});
