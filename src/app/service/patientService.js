// src/services/patientService.js

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in all requests
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
          console.error("Auth token parse алдаа:", error);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error.response?.status, error.message);
    
    // Handle unauthorized errors (redirect to login)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/authentication/login';
      }
    }
    return Promise.reject(error);
  }
);

const patientService = {
  // Get all patients (for medical staff and admin)
  getAllPatients: async () => {
    try {
      console.log('Fetching patients...');
      const response = await apiClient.get('/patient/view');
      console.log('Patients fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to fetch patients' };
    }
  },

  // Create a new patient (adapted for the customer registration)
  createPatient: async (patientData) => {
    try {
      console.log('Creating patient with data:', patientData);
      const response = await apiClient.post('/auth/register', {
        ...patientData,
        role: 'Patient'
      });
      console.log('Patient created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to create patient' };
    }
  },

  // Update a patient
  // In patientService.js
updatePatient: async (id, patientData) => {
  try {
    if (!id) {
      throw new Error('Patient ID is required');
    }

    console.log(`Updating patient ${id} with:`, patientData);
    const response = await apiClient.put(`/patient/${id}`, patientData);
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    return response.data;
  } catch (error) {
    console.error('Update error details:', {
      url: `/patient/${id}`,
      requestData: patientData,
      error: error.response?.data || error.message
    });
    
    throw error.response?.data || { 
      error: error.message || 'Failed to update patient' 
    };
  }
},

  // Delete a patient
  deletePatient: async (id) => {
    try {
      console.log(`Deleting patient ${id}`);
      const response = await apiClient.delete(`/patient/${id}`);
      console.log('Patient deleted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to delete patient' };
    }
  },

  // Get patient's own examinations (for patients)
  getOwnExaminations: async () => {
    try {
      const response = await apiClient.get('/patient/me/examinations');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch examinations' };
    }
  },

  // Get patient's own profile (for patients)
  getOwnProfile: async () => {
    try {
      const response = await apiClient.get('/patient/me/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch profile' };
    }
  },

  // Get patient's allergies
  getPatientAllergies: async (patientId) => {
    try {
      const response = await apiClient.get(`/allergy/patient/allergy/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch allergies' };
    }
  },
  createPatientAllergy: async (allergyData) => {
    try {
      const response = await apiClient.post(`/allergy`, allergyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create allergy' };
    }
  },
  
  

  updatePatientAllergy: async (id, allergyData) => {
    try {
      const response = await apiClient.put(`/allergy/${id}`, allergyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update allergy' };
    }
  },
  deletePatientAllergy: async (id) => {
    try {
      const response = await apiClient.delete(`/allergy/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete allergy' };
    }
  },

  // Patient-specific allergy management
  getMyAllergies: async () => {
    try {
      const response = await apiClient.get('/patient/me/allergies');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch allergies' };
    }
  },

  createMyAllergy: async (allergyData) => {
    try {
      const response = await apiClient.post('/patient/me/allergies', allergyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create allergy' };
    }
  },

  updateMyAllergy: async (id, allergyData) => {
    try {
      const response = await apiClient.put(`/patient/me/allergies/${id}`, allergyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update allergy' };
    }
  },

  deleteMyAllergy: async (id) => {
    try {
      const response = await apiClient.delete(`/patient/me/allergies/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete allergy' };
    }
  },


  // Add these chronic disease methods to your existing patientService object

// Get patient's chronic diseases
getPatientChronicDiseases: async (patientId) => {
  try {
    const response = await apiClient.get(`/chronicdisease/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch chronic diseases' };
  }
},

createPatientChronicDisease: async (diseaseData) => {
  try {
    const response = await apiClient.post(`/chronicdisease`, diseaseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to create chronic disease' };
  }
},

updatePatientChronicDisease: async (id, diseaseData) => {
  try {
    const response = await apiClient.put(`/chronicdisease/${id}`, diseaseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update chronic disease' };
  }
},

deletePatientChronicDisease: async (id) => {
  try {
    const response = await apiClient.delete(`/chronicdisease/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete chronic disease' };
  }
},

// Patient-specific chronic disease management (for patients themselves)
getMyChronicDiseases: async () => {
  try {
    const response = await apiClient.get('/chronicdisease/my/diseases');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch chronic diseases' };
  }
},

createMyChronicDisease: async (diseaseData) => {
  try {
    const response = await apiClient.post('/chronicdisease/my/diseases', diseaseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to create chronic disease' };
  }
},

updateMyChronicDisease: async (id, diseaseData) => {
  try {
    const response = await apiClient.put(`/chronicdisease/my/diseases/${id}`, diseaseData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to update chronic disease' };
  }
},

deleteMyChronicDisease: async (id) => {
  try {
    const response = await apiClient.delete(`/chronicdisease/my/diseases/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to delete chronic disease' };
  }
},
  

  // Authentication
  login: async (credentials) => {
    try {
      console.log('Logging in with credentials:', credentials);
      
      // Support both phone and email login
      const endpoint = credentials.email ? '/auth/login' : '/auth/login';
      
      const response = await apiClient.post(endpoint, credentials);
      console.log('Login successful:', response.data);
      
      // Store token and user data in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('Token and user stored in localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.message);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { error: 'Failed to login' };
    }
  },

  logout: () => {
    console.log('Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default patientService;