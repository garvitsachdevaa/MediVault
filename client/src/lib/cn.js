import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge conditional class names (clsx) and resolve Tailwind conflicts
// (tailwind-merge) so later classes always win — the standard pattern used
// across our CVA-based components. Keeps call sites terse and conflict-free.
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
