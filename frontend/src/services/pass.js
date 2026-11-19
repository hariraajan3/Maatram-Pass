import client from './api';

export const getPass = (userId) =>
  client.get(`/pass/${userId}`).then((r) => r.data);

export const getPassQr = (userId) =>
  client.get(`/pass/${userId}/qr`).then((r) => r.data);
