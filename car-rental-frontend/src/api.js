import axios from "axios";

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || "http://localhost:8000") + "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers.Accept = "application/json";
  return config;
});

export default api;
