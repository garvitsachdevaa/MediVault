import { CheckCircle2, AlertTriangle, XCircle, Clock, HelpCircle } from 'lucide-react';

// Each status shows an icon + text label + colour — never colour alone.
const MAP = {
  normal: { label: 'Normal', cls: 'text-status-normal bg-status-normal-bg', Icon: CheckCircle2 },
  verified: { label: 'Verified', cls: 'text-status-normal bg-status-normal-bg', Icon: CheckCircle2 },
  review: { label: 'Needs review', cls: 'text-status-review bg-status-review-bg', Icon: AlertTriangle },
  borderline: { label: 'Borderline', cls: 'text-status-review bg-status-review-bg', Icon: AlertTriangle },
  high: { label: 'High', cls: 'text-status-danger bg-status-danger-bg', Icon: XCircle },
  low: { label: 'Low', cls: 'text-status-danger bg-status-danger-bg', Icon: XCircle },
  failed: { label: 'Failed', cls: 'text-status-danger bg-status-danger-bg', Icon: XCircle },
  pending: { label: 'Pending', cls: 'text-status-pending bg-status-pending-bg', Icon: Clock },
  processing: { label: 'Processing', cls: 'text-status-pending bg-status-pending-bg', Icon: Clock },
  unknown: { label: 'Unknown', cls: 'text-status-pending bg-status-pending-bg', Icon: HelpCircle },
};

export function StatusChip({ status = 'unknown', label, className = '' }) {
  const s = MAP[status] || MAP.unknown;
  const { Icon } = s;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label || s.label}
    </span>
  );
}
