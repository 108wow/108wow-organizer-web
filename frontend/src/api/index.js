/**
 * API Helper — ศูนย์กลางเรียก Backend API
 * ใช้แทน mockData.js ในทุกหน้า
 */

const API_BASE = '/api';

// ─── Token Management ───
export function getToken() {
  return localStorage.getItem('admin_token');
}

export function setToken(token) {
  localStorage.setItem('admin_token', token);
}

export function removeToken() {
  localStorage.removeItem('admin_token');
}

export function getUser() {
  const u = localStorage.getItem('admin_user');
  return u ? JSON.parse(u) : null;
}

export function setUser(user) {
  localStorage.setItem('admin_user', JSON.stringify(user));
}

export function removeUser() {
  localStorage.removeItem('admin_user');
}

// ─── Fetch Helpers ───
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    // Token expired or invalid
    removeToken();
    removeUser();
    // Optionally redirect to login
    if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/login')) {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

function get(endpoint) {
  return request(endpoint);
}

function post(endpoint, data) {
  return request(endpoint, { method: 'POST', body: JSON.stringify(data) });
}

function put(endpoint, data) {
  return request(endpoint, { method: 'PUT', body: JSON.stringify(data) });
}

function del(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}

// ─── Auth ───
export async function login(username, password) {
  const data = await post('/auth/login', { username, password });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function getMe() {
  return get('/auth/me');
}

export function logout() {
  removeToken();
  removeUser();
}

// ─── Heroes ───
export const heroAPI = {
  list: () => get('/heroes'),
  get: (id) => get(`/heroes/${id}`),
  create: (data) => post('/heroes', data),
  update: (id, data) => put(`/heroes/${id}`, data),
  delete: (id) => del(`/heroes/${id}`),
};

// ─── Services ───
export const serviceAPI = {
  list: () => get('/services'),
  get: (id) => get(`/services/${id}`),
  create: (data) => post('/services', data),
  update: (id, data) => put(`/services/${id}`, data),
  delete: (id) => del(`/services/${id}`),
};

// ─── Gallery ───
export const galleryAPI = {
  list: () => get('/gallery'),
  get: (id) => get(`/gallery/${id}`),
  create: (data) => post('/gallery', data),
  update: (id, data) => put(`/gallery/${id}`, data),
  delete: (id) => del(`/gallery/${id}`),
};

// ─── Blog ───
export const blogAPI = {
  listPublished: () => get('/blog'),
  listAll: () => get('/blog/all'),
  get: (id) => get(`/blog/${id}`),
  create: (data) => post('/blog', data),
  update: (id, data) => put(`/blog/${id}`, data),
  delete: (id) => del(`/blog/${id}`),
};

// ─── Team ───
export const teamAPI = {
  list: () => get('/team'),
  create: (data) => post('/team', data),
  update: (id, data) => put(`/team/${id}`, data),
  delete: (id) => del(`/team/${id}`),
};

// ─── Clients ───
export const clientAPI = {
  list: () => get('/clients'),
  create: (data) => post('/clients', data),
  update: (id, data) => put(`/clients/${id}`, data),
  delete: (id) => del(`/clients/${id}`),
};

// ─── Company ───
export const companyAPI = {
  get: () => get('/company'),
  update: (data) => put('/company', data),
  listStats: () => get('/company/stats'),
  createStat: (data) => post('/company/stats', data),
  updateStat: (id, data) => put(`/company/stats/${id}`, data),
  deleteStat: (id) => del(`/company/stats/${id}`),
};

// ─── Page Heroes ───
export const pageHeroAPI = {
  list: () => get('/page-heroes'),
  update: (pageKey, data) => put(`/page-heroes/${pageKey}`, data),
};

// ─── Home Config ───
export const homeConfigAPI = {
  get: () => get('/home-config'),
  update: (data) => put('/home-config', data),
};

// ─── About Config ───
export const aboutConfigAPI = {
  get: () => get('/about-config'),
  update: (data) => put('/about-config', data),
};

// ─── Contact ───
export const contactAPI = {
  submit: (data) => post('/contact', data),
  listMessages: () => get('/contact/messages'),
  updateMessage: (id, data) => put(`/contact/messages/${id}`, data),
  deleteMessage: (id) => del(`/contact/messages/${id}`),
};

// ─── Upload ───
export async function uploadImage(file) {
  const formData = new FormData();
  const filename = file.name || 'image.png';
  formData.append('file', file, filename);

  const token = getToken();
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(err.error || 'Upload failed');
  }

  return res.json(); // { url, filename }
}
