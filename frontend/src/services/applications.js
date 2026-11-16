import api from '/api';

export const apply = (opportunityId, interested = false) =>
  api.post('/applications', { opportunityId, interested }).then((r) => r.data);

export const myApplications = () =>
  api.get('/applications/my').then((r) => r.data);

export const opportunityApplicants = (opportunityId) =>
  api.get(`/applications/opportunity/${opportunityId}`).then((r) => r.data);

export const selectVolunteer = (applicationId) =>
  api.patch(`/applications/${applicationId}/select`).then((r) => r.data);

export const confirmApplication = (applicationId, confirm) =>
  api.patch(`/applications/${applicationId}/confirm`, { confirm }).then((r) => r.data);

export const withdrawApplication = (applicationId) =>
  api.patch(`/applications/${applicationId}/withdraw`).then((r) => r.data);

export const promoteFromWaitlist = (applicationId) =>
  api.patch(`/applications/${applicationId}/promote`).then((r) => r.data);
