import { API_URL } from './config';

async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw Object.assign(new Error('Cannot reach the server. Check your connection and try again.'), { fields: {} });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.message || 'Something went wrong.'), { code: data.code, fields: data.fields || {} });
  return data;
}

export const api = {
  register: (b) => request('/api/auth/register', { method: 'POST', body: b }),
  verifyOtp: (b) => request('/api/auth/verify-otp', { method: 'POST', body: b }),
  login: (b) => request('/api/auth/login', { method: 'POST', body: b }),
  saveDetails: (token, b) => request('/api/user/basic-details', { method: 'PUT', body: b, token }),
  getTasks: (token) => request('/api/tasks', { token }),
  selectTask: (token, taskId) => request('/api/tasks/select', { method: 'POST', body: { taskId }, token }),
};
