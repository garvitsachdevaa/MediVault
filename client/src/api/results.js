import api from './client.js';

export const getTests = (profileId) =>
  api.get(`/profiles/${profileId}/results/tests`).then((r) => r.data.tests);

export const getSeries = (profileId, testCode) =>
  api.get(`/profiles/${profileId}/results/series`, { params: { testCode } }).then((r) => r.data);

export const logHome = (profileId, data) =>
  api.post(`/profiles/${profileId}/results/home`, data).then((r) => r.data.results);

export const deleteHome = (profileId, id) =>
  api.delete(`/profiles/${profileId}/results/home/${id}`).then((r) => r.data);
