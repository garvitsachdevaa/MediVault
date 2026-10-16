import api from './client.js';

// Per-resource auth API calls. Each returns the parsed response body.
export const register = (data) => api.post('/auth/register', data).then((r) => r.data);
export const login = (data) => api.post('/auth/login', data).then((r) => r.data);
export const getMe = () => api.get('/auth/me').then((r) => r.data);
export const updateMe = (data) => api.patch('/auth/me', data).then((r) => r.data);
export const changePassword = (data) => api.patch('/auth/me/password', data).then((r) => r.data);
