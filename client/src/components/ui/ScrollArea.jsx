import * as RadixScrollArea from '@radix-ui/react-scroll-area';
import { cn } from '../../lib/cn.js';

// Styled, cross-browser scroll container on Radix ScrollArea. The viewport
// takes your className for sizing; a slim, auto-hiding thumb keeps long lists
// feeling native and premium.
export function ScrollArea({ className = '', viewportClassName = '', children, ...props }) {
  return (
    <RadixScrollArea.Root
      type="hover"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <RadixScrollArea.Viewport className={cn('h-full w-full rounded-[inherit]', viewportClassName)}>
        {children}
      </RadixScrollArea.Viewport>
      <RadixScrollArea.Scrollbar
        orientation="vertical"
        className="flex touch-none select-none p-0.5 transition-colors duration-150 data-[orientation=vertical]:w-2.5"
      >
        <RadixScrollArea.Thumb className="relative flex-1 rounded-full bg-ink-300/70 hover:bg-ink-400/70" />
      </RadixScrollArea.Scrollbar>
      <RadixScrollArea.Corner />
    </RadixScrollArea.Root>
  );
}
