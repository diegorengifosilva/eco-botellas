import axios from 'axios';

// Usar VITE_API_URL si está definido en el entorno, sino usar localhost en puerto 8009 por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8009/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT en cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores comunes de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si la sesión expira o es inválida
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al login si no estamos ya en él
      if (!window.location.pathname.endsWith('/login') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
