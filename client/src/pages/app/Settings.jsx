import { Settings as SettingsIcon } from 'lucide-react';
import { PlaceholderTab } from '../../components/layout/PlaceholderTab.jsx';

export default function Settings() {
  return (
    <PlaceholderTab
      icon={SettingsIcon}
      title="Settings"
      message="Account name, photo, password and the danger zone appear here in a later step."
    />
  );
}
