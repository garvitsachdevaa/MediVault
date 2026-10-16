import { Bell } from 'lucide-react';
import { PlaceholderTab } from '../../components/layout/PlaceholderTab.jsx';

export default function Notifications() {
  return (
    <PlaceholderTab
      icon={Bell}
      title="Notifications"
      message="Reminders and family notifications appear here once real-time updates are enabled."
    />
  );
}
