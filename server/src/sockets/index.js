import { Server } from 'socket.io';
import { clientOrigins } from '../config/env.js';
import { verifyToken } from '../utils/tokens.js';
import { Membership } from '../models/Membership.js';

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: clientOrigins, credentials: false },
  });

  // Authenticate the handshake with the JWT passed in `auth.token`.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = verifyToken(token);
      socket.userId = String(payload.sub);
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // Personal room — all of a user's notifications are emitted here.
    socket.join(`user:${socket.userId}`);

    // Profile rooms (used for live document progress in Step 11). Membership checked.
    socket.on('join-profile', async (profileId) => {
      try {
        const member = await Membership.findOne({ profileId, userId: socket.userId });
        if (member) socket.join(`profile:${profileId}`);
      } catch {
        /* ignore malformed ids */
      }
    });

    socket.on('leave-profile', (profileId) => {
      socket.leave(`profile:${profileId}`);
    });
  });

  return io;
};

export const getIo = () => io;
