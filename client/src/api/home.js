import api from './client.js';

export const getHome = (pid) => api.get(`/profiles/${pid}/home`).then((r) => r.data);
