export function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-status-danger">{error}</p>}
    </div>
  );
}
