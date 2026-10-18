import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext.jsx';
import { useSocket } from './SocketContext.jsx';
import * as notificationsApi from '../api/notifications.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [unread, setUnread] = useState(0);
  const [recent, setRecent] = useState([]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [{ count }, { notifications }] = await Promise.all([
        notificationsApi.unreadCount(),
        notificationsApi.list({ limit: 5 }),
      ]);
      setUnread(count);
      setRecent(notifications);
    } catch {
      /* ignore transient errors */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
      // Ask for browser-notification permission once, after login.
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } else {
      setUnread(0);
      setRecent([]);
    }
  }, [isAuthenticated, refresh]);

  // Live updates: a new notification bumps the badge, prepends to recent, toasts.
  // When the tab is hidden, also fire a native browser notification.
  useEffect(() => {
    if (!socket) return undefined;
    const onNew = (n) => {
      setUnread((c) => c + 1);
      setRecent((r) => [n, ...r].slice(0, 5));
      toast(n.title);
      if (
        document.hidden &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        try {
          // eslint-disable-next-line no-new
          new Notification(n.title, { body: n.body });
        } catch {
          /* ignore */
        }
      }
    };
    socket.on('notification:new', onNew);
    return () => socket.off('notification:new', onNew);
  }, [socket]);

  const markRead = useCallback(async (id) => {
    await notificationsApi.markRead(id);
    setUnread((c) => Math.max(0, c - 1));
    setRecent((r) => r.map((n) => (n._id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationsApi.markAllRead();
    setUnread(0);
    setRecent((r) => r.map((n) => ({ ...n, read: true })));
  }, []);

  const value = { unread, recent, refresh, markRead, markAllRead };
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return (
    useContext(NotificationContext) || {
      unread: 0,
      recent: [],
      refresh: () => {},
      markRead: () => {},
      markAllRead: () => {},
    }
  );
}
