import client from './client';

export const getEngagementReport = () =>
  client.get('/reports/engagement').then((r) => r.data);

export const getEmployerReport = (employerId, from, to) =>
  client.get('/reports/employer', { params: { employerId, from, to } }).then((r) => r.data);

export const getEmployerCsv = (employerId, from, to) =>
  client.get('/reports/employer/csv', {
    params: { employerId, from, to },
    responseType: 'blob'
  }).then((r) => r.data);

export const getWhoToCall = (filters) =>
  client.get('/reports/who-to-call', { params: filters }).then((r) => r.data);
