import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for token
apiClient.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem("USER");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const token = parsedUser.token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("Token parse error:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional response interceptor
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("USER");
      if (typeof window !== "undefined") {
        window.location.href = "/authentication/login";
      }
    }
    return Promise.reject(err);
  }
);

// Service methods
const medicalStaffService = {
  async getAllMedicalStaff() {
    const res = await apiClient.get("/medicalstaff");
    return res.data; // Return the medicalStaff array directly
  },
  async getMedicalStaffById(id) {
    const res = await apiClient.get(`/medicalstaff/${id}`);
    return res.data;
  },
  async createMedicalStaff(data) {
    const res = await apiClient.post("/medicalstaff", data);
    return res.data;
  },
  async updateMedicalStaff(id, data) {
    const res = await apiClient.put(`/medicalstaff/${id}`, data);
    return res.data;
  },
  async deleteMedicalStaff(id) {
    const res = await apiClient.delete(`/medicalstaff/${id}`);
    return res.data;
  },
  async getAllDoctors() {
    const res = await apiClient.get("/medicalstaff?position=Doctor");
    return res.data;
  },
  async getAllNurses() {
    const res = await apiClient.get("/medicalstaff?position=Nurse");
    return res.data;
  },
};

export default medicalStaffService;