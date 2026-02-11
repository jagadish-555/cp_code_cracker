import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authApi = {
  signup: (email, password, username) =>
    apiClient.post('/auth/signup', { email, password, username }),
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () =>
    apiClient.post('/auth/logout'),
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
  linkPlatform: (platform, platformUsername) =>
    apiClient.post('/auth/link-platform', { platform, platformUsername }),
};

export const problemsApi = {
  getProblems: (page = 1, limit = 20) =>
    apiClient.get('/problems', { params: { page, limit } }),
  searchProblems: (query, filters = {}) =>
    apiClient.get('/problems/search', { params: { q: query, ...filters } }),
  getProblemById: (id) =>
    apiClient.get(`/problems/${id}`),
  getProblemStats: () =>
    apiClient.get('/problems/stats'),
};

export const submissionsApi = {
  markSolved: (problemId) =>
    apiClient.post('/submissions/solved', { problemId }),
  markAttempted: (problemId) =>
    apiClient.post('/submissions/attempted', { problemId }),
  getSolvedProblems: (page = 1, limit = 20) =>
    apiClient.get('/submissions/solved', { params: { page, limit } }),
  getAttemptedProblems: (page = 1, limit = 20) =>
    apiClient.get('/submissions/attempted', { params: { page, limit } }),
  getProblemStats: () =>
    apiClient.get('/submissions/stats'),
  getStreak: () =>
    apiClient.get('/submissions/streak'),
  getHeatmap: (days = 365) =>
    apiClient.get('/submissions/heatmap', { params: { days } }),
  syncCodeforces: (username) =>
    apiClient.post('/submissions/sync-codeforces', { username }),
  syncLeetcode: (username) =>
    apiClient.post('/submissions/sync-leetcode', { username }),
  syncCodechef: (username) =>
    apiClient.post('/submissions/sync-codechef', { username }),
};

export const friendsApi = {
  sendRequest: (userId) =>
    apiClient.post('/friends/request', { addresseeId: userId }),
  acceptRequest: (requestId) =>
    apiClient.post('/friends/accept', { requestId }),
  rejectRequest: (requestId) =>
    apiClient.post('/friends/reject', { requestId }),
  removeFriend: (friendId) =>
    apiClient.post('/friends/remove', { friendId }),
  getPendingRequests: () =>
    apiClient.get('/friends/pending'),
  getFriendsList: () =>
    apiClient.get('/friends/list'),
  compareFriendStats: (friendId) =>
    apiClient.get(`/friends/compare/${friendId}`),
};

export const contestsApi = {
  getUpcomingContests: (days = 30) =>
    apiClient.get('/contests', { params: { days } }),
  syncContests: () =>
    apiClient.post('/contests/sync'),
  addReminder: (contestId, reminderTime) =>
    apiClient.post('/contests/reminder', { contestId, reminderTime }),
  getReminders: () =>
    apiClient.get('/contests/reminders'),
  removeReminder: (reminderId) =>
    apiClient.delete(`/contests/reminder/${reminderId}`),
};

export default apiClient;
