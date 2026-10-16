import { useState, useRef, useEffect } from 'react';

// Lightweight click-away dropdown. The panel closes on any click inside it.
export function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center">
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={`absolute z-40 mt-2 min-w-[13rem] rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ icon: Icon, children, ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50"
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 text-ink-400" aria-hidden="true" />}
      <span className="flex-1">{children}</span>
    </button>
  );
}
