import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getBooks = (params) => api.get("/books", { params });
export const getBook = (id) => api.get(`/books/${id}`);

export const createOrder = (data) => api.post("/orders", data);
export const getMyOrders = () => api.get("/orders/my");

export const createQRPayment = (data) => api.post("/payments/create-qr", data);
export const verifyPayment = (data) => api.post("/payments/verify", data);
export const cancelPayment = (data) => api.post("/payments/cancel", data);
export const getPaymentStatus = (paymentId) => api.get(`/payments/${paymentId}`);

export default api;
