import axios from "axios";
import { useAuthStore } from "../store/authStore";

// ✅ Detecta automáticamente el entorno
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // útil si manejas cookies o sesiones
});

// ✅ Interceptor para agregar el token JWT a cada petición
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
