// services/medicineService.js
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Token interceptor
apiClient.interceptors.request.use((config) => {
  const user = localStorage.getItem('USER');
  if (user) {
    const token = JSON.parse(user)?.token;
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

const medicineService = {
  async getAll() {
    const res = await apiClient.get('/medicine/list/all');
    return res.data;
  },
  
  async create(data) {
    const res = await apiClient.post("/medicine", data);
    return res.data;
  },
  
  async getById(id) {
    const res = await apiClient.get(`/medicine/${id}`);
    return res.data;
  },
  
  async update(id, data) {
    const res = await apiClient.put(`/medicine/${id}`, data);
    return res.data;
  },
  
  async delete(id) {
    const res = await apiClient.delete(`/medicine/${id}`);
    return res.data;
  }
};

export default medicineService;