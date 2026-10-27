import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'motion/react';
import { menuPanel } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';

// A click-away menu built on Radix Popover. Popover (rather than DropdownMenu)
// is deliberate: existing call sites render *arbitrary* children (plain links,
// paragraphs, dividers) and rely on "click anything inside to close". Popover
// gives us a portal, collision handling, outside-click + Esc dismissal and
// focus return, while preserving that flexible children contract exactly.
//
// Public API is unchanged: { trigger, children, align }. `align` maps to the
// matching Radix side alignment.
export function Dropdown({ trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const radixAlign = align === 'right' ? 'end' : 'start';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="flex items-center outline-none">
          {trigger}
        </button>
      </Popover.Trigger>
      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              asChild
              forceMount
              align={radixAlign}
              sideOffset={8}
              collisionPadding={12}
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <motion.div
                role="menu"
                // Preserve the long-standing behaviour: a click anywhere inside
                // the panel dismisses it.
                onClick={() => setOpen(false)}
                initial={menuPanel.initial}
                animate={menuPanel.animate}
                exit={menuPanel.exit}
                transition={menuPanel.transition}
                style={{
                  transformOrigin: 'var(--radix-popover-content-transform-origin)',
                }}
                className={cn(
                  'z-50 min-w-[13rem] rounded-xl border border-ink-200 bg-white p-1.5 shadow-lift'
                )}
              >
                {children}
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}

export function DropdownItem({ icon: Icon, children, className = '', ...props }) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-ink-700 outline-none transition hover:bg-ink-50 focus-visible:bg-ink-50 focus-visible:ring-2 focus-visible:ring-accent-500/40',
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 text-ink-400" aria-hidden="true" />}
      <span className="flex-1">{children}</span>
    </button>
  );
}
