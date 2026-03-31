const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

export const api = {
  get: (url: string) =>
    fetch(`${API_BASE}${url}`, { headers: headers() }).then(r => r.json()),

  post: (url: string, body: unknown) =>
    fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  put: (url: string, body: unknown) =>
    fetch(`${API_BASE}${url}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(body),
    }).then(r => r.json()),

  delete: (url: string) =>
    fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers: headers(),
    }).then(r => r.json()),

  patch: (url: string) =>
    fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers: headers(),
    }).then(r => r.json()),
};