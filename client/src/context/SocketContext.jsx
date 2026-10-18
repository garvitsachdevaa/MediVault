import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { useProfile } from './ProfileContext.jsx';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const { currentProfileId } = useProfile();
  const [socket, setSocket] = useState(null);

  // Connect after login; disconnect on logout.
  useEffect(() => {
    if (!isAuthenticated || !token) {
      setSocket(null);
      return undefined;
    }
    const s = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    setSocket(s);
    return () => s.disconnect();
  }, [isAuthenticated, token]);

  // Join the current profile room (for live document progress, etc.).
  useEffect(() => {
    if (!socket || !currentProfileId) return undefined;
    socket.emit('join-profile', currentProfileId);
    return () => socket.emit('leave-profile', currentProfileId);
  }, [socket, currentProfileId]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext) || { socket: null };
}
