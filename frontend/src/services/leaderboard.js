import client from './client';

export const getLeaderboard = (month) =>
  client.get('/leaderboard', { params: month ? { month } : {} }).then((r) => r.data);
