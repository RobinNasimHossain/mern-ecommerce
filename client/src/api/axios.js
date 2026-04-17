import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';

// Browsers strip userinfo from XHR/fetch URLs, so if VITE_API_URL contains
// `user:pass@host`, extract it and send it as a Basic auth header instead.
let baseURL = rawApiUrl;
let basicAuthHeader = null;
try {
  const parsed = new URL(rawApiUrl);
  if (parsed.username || parsed.password) {
    const creds = `${decodeURIComponent(parsed.username)}:${decodeURIComponent(parsed.password)}`;
    basicAuthHeader = `Basic ${btoa(creds)}`;
    parsed.username = '';
    parsed.password = '';
    baseURL = parsed.toString().replace(/\/$/, '');
  }
} catch {
  // rawApiUrl is a relative path like '/api' — leave it alone.
}

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (basicAuthHeader) {
    config.headers.Authorization = basicAuthHeader;
  }
  if (basicAuthHeader) {
    config.headers['X-Tunnel-Auth'] = basicAuthHeader;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
