import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Bell, CheckCheck } from 'lucide-react';
import * as notificationsApi from '../../api/notifications.js';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString();
}

export default function Notifications() {
  const { markAllRead, refresh } = useNotifications();
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await notificationsApi.list({ limit: 50 });
      setItems(data.notifications);
    } catch (e) {
      setError(e.message || 'Could not load notifications');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (n) => {
    if (!n.read) {
      await notificationsApi.markRead(n._id);
      refresh();
      setItems((list) => list.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    }
    if (n.link) navigate(n.link);
  };

  const allRead = async () => {
    await markAllRead();
    setItems((list) => list.map((x) => ({ ...x, read: true })));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900">Notifications</h1>
        <Button variant="subtle" size="sm" onClick={allRead}>
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : items === null ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" message="Reminders and family updates will appear here." />
      ) : (
        <Card className="divide-y divide-ink-100 p-0">
          {items.map((n) => (
            <button
              key={n._id}
              type="button"
              onClick={() => open(n)}
              className={`flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-ink-50 ${
                n.read ? '' : 'bg-accent-50/40'
              }`}
            >
              {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent-500" />}
              <div className={`min-w-0 flex-1 ${n.read ? 'pl-5' : ''}`}>
                <p className="text-sm font-medium text-ink-900">{n.title}</p>
                {n.body && <p className="text-sm text-ink-500">{n.body}</p>}
                <p className="mt-0.5 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
