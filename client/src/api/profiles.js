import api from './client.js';

export const listProfiles = () => api.get('/profiles').then((r) => r.data.profiles);
export const createProfile = (data) => api.post('/profiles', data).then((r) => r.data.profile);
export const getProfile = (id) => api.get(`/profiles/${id}`).then((r) => r.data.profile);
export const updateProfile = (id, data) =>
  api.patch(`/profiles/${id}`, data).then((r) => r.data.profile);

export const getSummary = (id) => api.get(`/profiles/${id}/summary`).then((r) => r.data);
export const updateSummary = (id, data) =>
  api.patch(`/profiles/${id}/summary`, data).then((r) => r.data.profile);

export const listMembers = (id) => api.get(`/profiles/${id}/members`).then((r) => r.data.members);
export const updateMemberRole = (id, userId, role) =>
  api.patch(`/profiles/${id}/members/${userId}`, { role }).then((r) => r.data);
export const removeMember = (id, userId) =>
  api.delete(`/profiles/${id}/members/${userId}`).then((r) => r.data);

export const createInvite = (id, data) =>
  api.post(`/profiles/${id}/invites`, data).then((r) => r.data);
