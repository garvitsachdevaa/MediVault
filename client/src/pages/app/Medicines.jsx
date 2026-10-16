import { Pill } from 'lucide-react';
import { PlaceholderTab } from '../../components/layout/PlaceholderTab.jsx';

export default function Medicines() {
  return (
    <PlaceholderTab
      icon={Pill}
      title="Medicines"
      message="Confirm a prescription and your medicine courses and reminders appear here."
    />
  );
}
