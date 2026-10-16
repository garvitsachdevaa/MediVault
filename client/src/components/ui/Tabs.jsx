export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div className={`flex gap-1 border-b border-slate-200 ${className}`} role="tablist">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(t.value)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
              active
                ? 'border-accent text-accent'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
