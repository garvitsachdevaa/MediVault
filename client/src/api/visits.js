import api from './client.js';

export const listVisits = (pid) => api.get(`/profiles/${pid}/visits`).then((r) => r.data.visits);
export const createVisit = (pid, data) => api.post(`/profiles/${pid}/visits`, data).then((r) => r.data.visit);
export const updateVisit = (id, data) => api.patch(`/visits/${id}`, data).then((r) => r.data.visit);
export const deleteVisit = (id) => api.delete(`/visits/${id}`).then((r) => r.data);
