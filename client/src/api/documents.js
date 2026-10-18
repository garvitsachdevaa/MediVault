import api from './client.js';

export const uploadDocument = (profileId, file, kind, onProgress) => {
  const form = new FormData();
  form.append('kind', kind);
  form.append('file', file);
  return api
    .post(`/profiles/${profileId}/documents`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    })
    .then((r) => r.data.document);
};

export const listDocuments = (profileId, params = {}) =>
  api.get(`/profiles/${profileId}/documents`, { params }).then((r) => r.data);

export const getDocument = (id) => api.get(`/documents/${id}`).then((r) => r.data.document);

export const getFileUrl = (id) => api.get(`/documents/${id}/file-url`).then((r) => r.data);

export const rerunDocument = (id) => api.post(`/documents/${id}/rerun`).then((r) => r.data.document);

export const getDetail = (id) => api.get(`/documents/${id}/detail`).then((r) => r.data);
export const removeDocument = (id) => api.delete(`/documents/${id}`).then((r) => r.data);
export const getReview = (id) => api.get(`/documents/${id}/review`).then((r) => r.data);
export const saveDraft = (id, draft) =>
  api.patch(`/documents/${id}/draft`, { draft }).then((r) => r.data.document);
export const confirmDocument = (id) => api.post(`/documents/${id}/confirm`).then((r) => r.data);
export const discardDocument = (id) => api.post(`/documents/${id}/discard`).then((r) => r.data);
