import { FolderOpen } from 'lucide-react';
import { PlaceholderTab } from '../../components/layout/PlaceholderTab.jsx';

export default function Records() {
  return (
    <PlaceholderTab
      icon={FolderOpen}
      title="Records"
      message="Your uploaded documents and health timeline appear here once uploads are enabled."
    />
  );
}
