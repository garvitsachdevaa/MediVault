export function Tabs({ tabs, value, onChange, className = '' }) {
  return (
    <div
      className={`flex gap-1 border-b border-ink-200 ${className}`}
      role="tablist"
    >
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(t.value)}
            className={`relative -mb-px rounded-t-lg px-3.5 py-2.5 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-accent-500/40 ${
              active
                ? 'text-accent-700'
                : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
            }`}
          >
            {t.label}
            <span
              aria-hidden="true"
              className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-600 transition-opacity ${
                active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
