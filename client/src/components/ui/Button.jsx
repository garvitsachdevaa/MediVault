import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn.js';

// Variants are tuned for a calm clinical system: the primary carries a touch of
// depth (gradient + branded glow on hover), the rest stay quiet and tactile.
// Built on CVA so variant/size composition is declarative and conflict-safe.
export const buttonVariants = cva(
  'group relative inline-flex select-none items-center justify-center font-semibold outline-none ring-offset-2 ring-offset-white transition-[background-color,box-shadow,border-color,color,transform] duration-150 ease-out focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-55',
  {
    variants: {
      variant: {
        primary:
          'bg-accent-grad bg-accent-600 text-white shadow-sm hover:shadow-glow active:brightness-[0.96] focus-visible:ring-accent-500/60',
        secondary:
          'bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-200/80 focus-visible:ring-ink-300',
        danger:
          'bg-status-danger text-white shadow-sm hover:brightness-[0.94] active:brightness-90 focus-visible:ring-status-danger/50',
        outline:
          'border border-ink-200 bg-white text-ink-800 shadow-xs hover:border-ink-300 hover:bg-ink-50 active:bg-ink-100 focus-visible:ring-accent-500/50',
        ghost:
          'bg-transparent text-ink-700 hover:bg-ink-100 active:bg-ink-200/70 focus-visible:ring-ink-300',
        subtle:
          'bg-accent-50 text-accent-800 ring-1 ring-inset ring-accent-100 hover:bg-accent-100 active:bg-accent-200/70 focus-visible:ring-accent-500/50',
        link: 'bg-transparent px-0 text-accent-700 underline-offset-4 hover:text-accent-800 hover:underline focus-visible:ring-accent-500/40',
        // For use on dark/accent surfaces (e.g. CTA panels).
        white:
          'bg-white text-accent-800 shadow-sm hover:bg-accent-50 active:bg-accent-100 focus-visible:ring-white/70',
        inverse:
          'bg-transparent text-accent-100 ring-1 ring-inset ring-white/25 hover:bg-white/10 hover:text-white focus-visible:ring-white/60',
      },
      size: {
        sm: 'h-9 gap-1.5 px-3 text-sm rounded-lg',
        md: 'h-11 gap-2 px-4 text-sm rounded-xl',
        lg: 'h-12 gap-2 px-5 text-base rounded-xl',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  // `link` ignores the size box model but keeps gap/text sizing.
  const sizeForVariant = variant === 'link' ? undefined : size;
  const isDisabled = disabled || loading;
  return (
    <motion.button
      ref={ref}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
      className={cn(
        buttonVariants({ variant, size: sizeForVariant }),
        variant === 'link' && 'gap-1.5 text-sm',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />}
      {children}
    </motion.button>
  );
});
