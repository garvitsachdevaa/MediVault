import api from './client.js';

export const getInvite = (token) => api.get(`/invites/${token}`).then((r) => r.data.invite);
export const acceptInvite = (token) => api.post(`/invites/${token}/accept`).then((r) => r.data);
export const pendingInvites = () => api.get('/invites/pending').then((r) => r.data.invites);
