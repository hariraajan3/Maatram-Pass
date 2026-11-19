import client from './api';

export const listOpportunities = (filters) =>
  client.get('/opportunities', { params: filters }).then((r) => r.data);

export const getOpportunity = (id) =>
  client.get(`/opportunities/${id}`).then((r) => r.data);

export const createOpportunity = (data) =>
  client.post('/opportunities', data).then((r) => r.data);

export const updateOpportunity = (id, data) =>
  client.put(`/opportunities/${id}`, data).then((r) => r.data);

export const changeOpportunityStatus = (id, status) =>
  client.patch(`/opportunities/${id}/status`, { status }).then((r) => r.data);
