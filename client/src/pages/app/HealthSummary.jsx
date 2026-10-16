import { HeartPulse } from 'lucide-react';
import { PlaceholderTab } from '../../components/layout/PlaceholderTab.jsx';

export default function HealthSummary() {
  return (
    <PlaceholderTab
      icon={HeartPulse}
      title="Health Summary"
      message="Allergies, conditions, immunisations and key results appear here in the next step."
    />
  );
}
