const API_BASE = '/api';

async function fetchJson(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Practice
  getTodayPractice: () => fetchJson('/practice/today'),
  recordAttempt: (data) => fetchJson('/practice/attempt', { method: 'POST', body: JSON.stringify(data) }),

  // Problems
  getProblems: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`/problems${query ? `?${query}` : ''}`);
  },
  getProblem: (id) => fetchJson(`/problems/${id}`),
  createProblem: (data) => fetchJson('/problems', { method: 'POST', body: JSON.stringify(data) }),
  updateProblem: (id, data) => fetchJson(`/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProblem: (id) => fetchJson(`/problems/${id}`, { method: 'DELETE' }),
  logProblemAttempt: (id, data) => fetchJson(`/problems/${id}/attempts`, { method: 'POST', body: JSON.stringify(data) }),

  // Problem Comments
  addProblemComment: (problemId, content) => fetchJson(`/problems/${problemId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteProblemComment: (commentId) => fetchJson(`/problems/comments/${commentId}`, { method: 'DELETE' }),

  // Solutions
  addSolution: (problemId, data) => fetchJson(`/problems/${problemId}/solutions`, { method: 'POST', body: JSON.stringify(data) }),
  updateSolution: (id, data) => fetchJson(`/solutions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSolution: (id) => fetchJson(`/solutions/${id}`, { method: 'DELETE' }),

  // Tags
  getTags: () => fetchJson('/tags'),

  // Stats
  getStats: () => fetchJson('/stats'),

  // Settings
  getSettings: () => fetchJson('/settings'),
  updateSettings: (key, value) => fetchJson('/settings', { method: 'PUT', body: JSON.stringify({ key, value }) }),

  // Backup / Restore
  exportBackup: async () => {
    const res = await fetch(`${API_BASE}/backup/export`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || `HTTP error ${res.status}`);
    }
    return res.blob();
  },
  inspectBackup: (backupData) => fetchJson('/backup/inspect', { method: 'POST', body: JSON.stringify(backupData) }),
  importBackup: (payload) => fetchJson('/backup/import', { method: 'POST', body: JSON.stringify(payload) }),
};
