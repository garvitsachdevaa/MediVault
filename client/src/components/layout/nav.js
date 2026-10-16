import { Home, HeartPulse, FolderOpen, Pill, Activity, CalendarDays } from 'lucide-react';

// Primary navigation, shared by the desktop sidebar and mobile bottom bar.
export const NAV = [
  { to: '/app', end: true, label: 'Home', Icon: Home },
  { to: '/app/summary', label: 'Health Summary', Icon: HeartPulse },
  { to: '/app/records', label: 'Records', Icon: FolderOpen },
  { to: '/app/medicines', label: 'Medicines', Icon: Pill },
  { to: '/app/results', label: 'Results', Icon: Activity },
  { to: '/app/visits', label: 'Visits', Icon: CalendarDays },
];

// On mobile these four sit in the bottom bar; the rest live under "More".
export const MOBILE_PRIMARY = ['/app', '/app/records', '/app/medicines', '/app/results'];
