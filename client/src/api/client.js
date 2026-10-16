import axios from 'axios';

// Single axios instance for the whole app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach the JWT (stored in localStorage) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise every error into { code, message, details, status } and log the user
// out on 401 (expired/invalid token).
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const serverError = error.response?.data?.error;

    if (status === 401) {
      localStorage.removeItem('token');
      const path = window.location.pathname;
      if (!['/', '/login', '/register'].includes(path)) {
        window.location.href = '/login';
      }
    }

    return Promise.reject({
      code: serverError?.code || 'NETWORK_ERROR',
      message: serverError?.message || error.message || 'Something went wrong',
      details: serverError?.details,
      status,
    });
  }
);

export default api;
