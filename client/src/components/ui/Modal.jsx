import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { modalPanel, backdrop } from '../../lib/motion.js';
import { cn } from '../../lib/cn.js';

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

// Accessible dialog built on Radix (focus trap, scroll lock, Esc, aria wiring)
// with our spring panel + backdrop motion layered on top. Public API is
// unchanged — { open, onClose, title, children, footer } — with additive
// `description` and `size` props.
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose?.()}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-ink-900/45 backdrop-blur-sm"
                initial={backdrop.initial}
                animate={backdrop.animate}
                exit={backdrop.exit}
                transition={backdrop.transition}
              />
            </Dialog.Overlay>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <Dialog.Content asChild forceMount aria-label={!title ? 'Dialog' : undefined}>
                <motion.div
                  className={cn(
                    'relative w-full rounded-2xl border border-ink-200/70 bg-white p-6 shadow-overlay',
                    sizes[size] || sizes.md
                  )}
                  initial={modalPanel.initial}
                  animate={modalPanel.animate}
                  exit={modalPanel.exit}
                  transition={modalPanel.transition}
                >
                  <div className="flex items-start justify-between gap-4">
                    {title ? (
                      <Dialog.Title className="text-lg font-semibold tracking-tight text-ink-900">
                        {title}
                      </Dialog.Title>
                    ) : (
                      <Dialog.Title className="sr-only">Dialog</Dialog.Title>
                    )}
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        aria-label="Close"
                        className="-mr-1.5 -mt-1.5 rounded-lg p-1.5 text-ink-400 outline-none transition hover:bg-ink-100 hover:text-ink-700 focus-visible:ring-2 focus-visible:ring-accent-500/50"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                  {description ? (
                    <Dialog.Description className="mt-1 text-sm leading-relaxed text-ink-500">
                      {description}
                    </Dialog.Description>
                  ) : (
                    <Dialog.Description className="sr-only">{title || 'Dialog'}</Dialog.Description>
                  )}
                  <div className="mt-3 text-sm leading-relaxed text-ink-600">{children}</div>
                  {footer && (
                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                      {footer}
                    </div>
                  )}
                </motion.div>
              </Dialog.Content>
            </div>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
