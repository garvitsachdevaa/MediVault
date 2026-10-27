import * as RadixTooltip from '@radix-ui/react-tooltip';
import { cn } from '../../lib/cn.js';

// Accessible tooltip on Radix. Wrap your app (or a subtree) once in
// <TooltipProvider>, then use <Tooltip content="…">{trigger}</Tooltip>.
export function TooltipProvider({ children, delayDuration = 200 }) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration} skipDelayDuration={300}>
      {children}
    </RadixTooltip.Provider>
  );
}

export function Tooltip({ content, children, side = 'top', align = 'center', className = '' }) {
  if (!content) return children;
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 max-w-xs rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lift',
            'data-[state=delayed-open]:animate-content-in',
            className
          )}
        >
          {content}
          <RadixTooltip.Arrow className="fill-ink-900" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
