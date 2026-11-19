import client from './api';

export const checkIn = (userId, opportunityId, method, overrideNote) =>
  client.post('/attendance/checkin', { userId, opportunityId, method, overrideNote }).then((r) => r.data);

export const checkOut = (attendanceId) =>
  client.post(`/attendance/${attendanceId}/checkout`).then((r) => r.data);

export const opportunityAttendance = (opportunityId) =>
  client.get(`/attendance/opportunity/${opportunityId}`).then((r) => r.data);

export const needsReview = () =>
  client.get('/attendance/needs-review').then((r) => r.data);

export const editAttendance = (id, data) =>
  client.patch(`/attendance/${id}`, data).then((r) => r.data);
