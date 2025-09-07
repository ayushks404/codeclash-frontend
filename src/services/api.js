// src/services/api.js
import axios from 'axios';

// Prefer using VITE_API_URL in .env; fallback to http://localhost:4000/api
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 40000,
});

// Attach Authorization header automatically if token exists
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('cp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export default API;
