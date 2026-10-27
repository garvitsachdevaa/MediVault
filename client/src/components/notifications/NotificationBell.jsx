import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Bell } from 'lucide-react';
import { Dropdown } from '../ui/Dropdown.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';

export function NotificationBell() {
  const { unread, recent, markRead } = useNotifications();

  // Shake the bell whenever the unread count rises (a new notification arrives).
  const prevUnread = useRef(unread);
  const [shakeKey, setShakeKey] = useState(0);
  useEffect(() => {
    if (unread > prevUnread.current) setShakeKey((k) => k + 1);
    prevUnread.current = unread;
  }, [unread]);

  return (
    <Dropdown
      trigger={
        <span className="relative block rounded-full p-2 text-ink-500 hover:bg-ink-100">
          <motion.span
            key={shakeKey}
            className="block"
            animate={shakeKey ? { rotate: [0, -12, 10, -8, 6, 0] } : undefined}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            style={{ transformOrigin: 'top center' }}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
          </motion.span>
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 22 }}
                className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-status-danger px-1 text-[0.6rem] font-bold text-white"
              >
                {unread > 9 ? '9+' : unread}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      }
    >
      <p className="px-3 py-2 text-sm font-semibold text-ink-900">Notifications</p>
      <div className="my-1 h-px bg-ink-100" />
      {recent.length === 0 ? (
        <p className="px-3 py-4 text-center text-sm text-ink-500">No notifications yet</p>
      ) : (
        recent.map((n) => (
          <Link
            key={n._id}
            to={n.link || '/app/notifications'}
            onClick={() => !n.read && markRead(n._id)}
            className={`block rounded-lg px-3 py-2 hover:bg-ink-50 ${n.read ? '' : 'bg-accent-50/60'}`}
          >
            <p className="text-sm font-medium text-ink-900">{n.title}</p>
            {n.body && <p className="line-clamp-2 text-xs text-ink-500">{n.body}</p>}
          </Link>
        ))
      )}
      <div className="my-1 h-px bg-ink-100" />
      <Link
        to="/app/notifications"
        className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-accent-700 hover:bg-ink-50"
      >
        See all
      </Link>
    </Dropdown>
  );
}
