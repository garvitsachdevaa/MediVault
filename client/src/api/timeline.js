import api from './client.js';

export const getTimeline = (profileId, params = {}) =>
  api.get(`/profiles/${profileId}/timeline`, { params }).then((r) => r.data);
