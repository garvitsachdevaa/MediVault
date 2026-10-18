import { Notification } from '../models/Notification.js';
import { Membership } from '../models/Membership.js';
import { getIo } from '../sockets/index.js';

const RANK = { viewer: 1, caregiver: 2, owner: 3 };

// Save Notification docs and push them live to each user's personal room.
export const notifyUsers = async (userIds, payload) => {
  const ids = [...new Set(userIds.map(String))];
  if (!ids.length) return [];
  const docs = await Notification.insertMany(ids.map((userId) => ({ userId, ...payload })));
  const io = getIo();
  if (io) docs.forEach((doc) => io.to(`user:${doc.userId}`).emit('notification:new', doc));
  return docs;
};

// Notify everyone on a profile (optionally only roles >= minRole, excluding one user).
export const notifyProfileMembers = async (profileId, payload, { minRole, excludeUserId } = {}) => {
  const members = await Membership.find({ profileId });
  const userIds = members
    .filter((m) => !minRole || RANK[m.role] >= RANK[minRole])
    .map((m) => String(m.userId))
    .filter((id) => id !== String(excludeUserId));
  return notifyUsers(userIds, { ...payload, profileId });
};
