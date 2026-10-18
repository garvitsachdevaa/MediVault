import api from './client.js';

export const listShares = (pid) => api.get(`/profiles/${pid}/shares`).then((r) => r.data.shares);
export const createShare = (pid, data) => api.post(`/profiles/${pid}/shares`, data).then((r) => r.data);
export const revokeShare = (id) => api.post(`/shares/${id}/revoke`).then((r) => r.data);

// Public (doctor view — no auth).
export const getPublicShare = (token) => api.get(`/public/shares/${token}`).then((r) => r.data);
export const getPublicShareDocUrl = (token, docId) =>
  api.get(`/public/shares/${token}/documents/${docId}/file-url`).then((r) => r.data);
export const addPublicNote = (token, data) =>
  api.post(`/public/shares/${token}/notes`, data).then((r) => r.data);
