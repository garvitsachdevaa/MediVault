import api from './client.js';

export const listMedications = (profileId, status) =>
  api.get(`/profiles/${profileId}/medications`, { params: status ? { status } : {} }).then((r) => r.data.medications);

export const updateMedication = (id, data) =>
  api.patch(`/medications/${id}`, data).then((r) => r.data.medication);

export const getMedicationDoses = (id, params = {}) =>
  api.get(`/medications/${id}/doses`, { params }).then((r) => r.data.doses);

export const getTodayDoses = (profileId) =>
  api.get(`/profiles/${profileId}/doses/today`).then((r) => r.data.doses);

export const updateDose = (id, status) =>
  api.patch(`/doses/${id}`, { status }).then((r) => r.data.dose);

export const FREQ_WORDS = {
  OD: 'Once a day',
  BD: 'Twice a day',
  TDS: 'Three times a day',
  QID: 'Four times a day',
  HS: 'At bedtime',
  SOS: 'As needed',
  CUSTOM: 'Custom schedule',
};
