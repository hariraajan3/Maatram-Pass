import client from './client';

export const listEmployers = () =>
  client.get('/employers').then((r) => r.data);

export const suggestEmployer = (name) =>
  client.post('/employers/suggest', { name }).then((r) => r.data);

export const approveEmployer = (id) =>
  client.patch(`/employers/${id}/approve`).then((r) => r.data);

export const mergeEmployer = (id, targetId) =>
  client.patch(`/employers/${id}/merge`, { targetId }).then((r) => r.data);
