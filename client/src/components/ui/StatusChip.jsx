import { CheckCircle2, AlertTriangle, XCircle, Clock, Loader2, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/cn.js';

// Each status shows an icon + text label + colour — never colour alone (AA).
// Soft background, strong foreground, and a hairline border for crisp edges.
const normalCls = 'text-status-normal bg-status-normal-bg ring-status-normal-border';
const reviewCls = 'text-status-review bg-status-review-bg ring-status-review-border';
const dangerCls = 'text-status-danger bg-status-danger-bg ring-status-danger-border';
const pendingCls = 'text-status-pending bg-status-pending-bg ring-status-pending-border';

const MAP = {
  normal: { label: 'Normal', cls: normalCls, Icon: CheckCircle2 },
  verified: { label: 'Verified', cls: normalCls, Icon: CheckCircle2 },
  review: { label: 'Needs review', cls: reviewCls, Icon: AlertTriangle },
  borderline: { label: 'Borderline', cls: reviewCls, Icon: AlertTriangle },
  high: { label: 'High', cls: dangerCls, Icon: XCircle },
  low: { label: 'Low', cls: dangerCls, Icon: XCircle },
  failed: { label: 'Failed', cls: dangerCls, Icon: XCircle },
  pending: { label: 'Pending', cls: pendingCls, Icon: Clock },
  processing: { label: 'Processing', cls: pendingCls, Icon: Loader2 },
  unknown: { label: 'Unknown', cls: pendingCls, Icon: HelpCircle },
};

const sizes = {
  sm: 'gap-1 px-2 py-0.5 text-2xs',
  md: 'gap-1.5 px-2.5 py-1 text-xs',
};

export function StatusChip({ status = 'unknown', label, size = 'md', className = '' }) {
  const s = MAP[status] || MAP.unknown;
  const { Icon } = s;
  const spinning = status === 'processing';
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 520, damping: 26, mass: 0.5 }}
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full font-semibold ring-1 ring-inset',
        sizes[size] || sizes.md,
        s.cls,
        className
      )}
    >
      <Icon
        className={cn(
          size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5',
          'shrink-0',
          spinning && 'animate-spin'
        )}
        aria-hidden="true"
      />
      {label || s.label}
    </motion.span>
  );
}
