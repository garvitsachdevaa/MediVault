import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-dark',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  danger: 'bg-status-danger text-white hover:brightness-95',
  outline: 'border border-slate-300 text-slate-800 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
