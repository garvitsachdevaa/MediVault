import * as RadixTabs from '@radix-ui/react-tabs';
import { motion } from 'motion/react';
import { useId } from 'react';
import { cn } from '../../lib/cn.js';

// Controlled tab bar. Public API is unchanged — { tabs, value, onChange,
// className } — where `tabs` is [{ value, label }]. Content is owned by the
// caller (this renders the trigger row only), so we drive Radix Tabs in
// controlled mode purely for roving-focus keyboard nav + aria wiring, and
// layer a shared-layout motion underline on top for a premium active state.
export function Tabs({ tabs, value, onChange, className = '' }) {
  // Unique id so multiple Tabs instances on a page don't share a layout group.
  const groupId = useId();
  return (
    <RadixTabs.Root value={value} onValueChange={onChange} activationMode="automatic">
      <RadixTabs.List
        className={cn('flex gap-1 border-b border-ink-200', className)}
      >
        {tabs.map((t) => {
          const active = t.value === value;
          return (
            <RadixTabs.Trigger
              key={t.value}
              value={t.value}
              className={cn(
                'relative -mb-px rounded-t-lg px-3.5 py-2.5 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-500/40',
                active ? 'text-accent-700' : 'text-ink-500 hover:bg-ink-50 hover:text-ink-800'
              )}
            >
              {t.label}
              {active && (
                <motion.span
                  layoutId={`tab-underline-${groupId}`}
                  aria-hidden="true"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent-600"
                  transition={{ type: 'spring', stiffness: 520, damping: 40 }}
                />
              )}
            </RadixTabs.Trigger>
          );
        })}
      </RadixTabs.List>
    </RadixTabs.Root>
  );
}
