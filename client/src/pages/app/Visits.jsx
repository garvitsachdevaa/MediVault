import { CalendarDays } from 'lucide-react';
import { PlaceholderTab } from '../../components/layout/PlaceholderTab.jsx';

export default function Visits() {
  return (
    <PlaceholderTab
      icon={CalendarDays}
      title="Visits"
      message="Your appointment log and doctor share links appear here in a later step."
    />
  );
}
