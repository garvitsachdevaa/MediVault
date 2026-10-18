import api from './client.js';

export const listComments = (profileId, targetType, targetId) =>
  api
    .get(`/profiles/${profileId}/comments`, { params: { targetType, targetId } })
    .then((r) => r.data.comments);

export const addComment = (profileId, data) =>
  api.post(`/profiles/${profileId}/comments`, data).then((r) => r.data.comment);

export const removeComment = (id) => api.delete(`/comments/${id}`).then((r) => r.data);
