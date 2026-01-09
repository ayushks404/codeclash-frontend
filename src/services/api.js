
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" }
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("cp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  Handle unauthorized globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("cp_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default API;
