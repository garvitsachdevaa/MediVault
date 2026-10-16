import { Activity } from 'lucide-react';
import { PlaceholderTab } from '../../components/layout/PlaceholderTab.jsx';

export default function Results() {
  return (
    <PlaceholderTab
      icon={Activity}
      title="Results"
      message="Lab trends and home readings appear here once you confirm a lab report."
    />
  );
}
