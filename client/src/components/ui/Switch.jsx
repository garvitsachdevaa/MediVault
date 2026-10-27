import * as RadixSwitch from '@radix-ui/react-switch';
import { cn } from '../../lib/cn.js';

// Accessible toggle on Radix Switch. Controlled via { checked, onCheckedChange }
// or uncontrolled via { defaultChecked }. Visible focus ring + AA states.
export function Switch({ className = '', ...props }) {
  return (
    <RadixSwitch.Root
      className={cn(
        'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-none transition-colors',
        'bg-ink-200 data-[state=checked]:bg-accent-600',
        'focus-visible:ring-2 focus-visible:ring-accent-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-55',
        className
      )}
      {...props}
    >
      <RadixSwitch.Thumb className="pointer-events-none block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[1.375rem]" />
    </RadixSwitch.Root>
  );
}
