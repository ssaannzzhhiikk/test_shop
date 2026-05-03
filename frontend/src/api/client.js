import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function getProducts(params = {}, config = {}) {
  const response = await api.get("/api/products", { ...config, params });
  return response.data;
}

export async function getProduct(id) {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
}

export async function login(credentials) {
  const response = await api.post("/api/auth/login", credentials);
  return response.data;
}

export async function register(payload) {
  const response = await api.post("/api/auth/register", payload);
  return response.data;
}

export async function getMe() {
  const response = await api.get("/api/auth/me");
  return response.data;
}

export async function createCheckoutSession(items) {
  const response = await api.post("/api/payments/create-checkout-session", { items });
  return response.data;
}

export async function getMyOrders() {
  const response = await api.get("/api/orders/me");
  return response.data;
}
