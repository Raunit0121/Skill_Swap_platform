import axios from 'axios';

// Create axios instance with base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
};

// User API
export const userAPI = {
  searchUsers: async (params: {
    skill?: string;
    location?: string;
    availability?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/users/search', { params });
    return response.data;
  },

  getUserProfile: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateProfile: async (userId: string, profileData: any) => {
    let config = {};
    let data = profileData;
    if (profileData instanceof FormData) {
      config = { headers: { 'Content-Type': 'multipart/form-data' } };
    }
    const response = await api.put(`/users/${userId}`, data, config);
    return response.data;
  },

  getUserRequests: async (userId: string, params: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get(`/users/${userId}/requests`, { params });
    return response.data;
  },

  getUserStats: async (userId: string) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  deleteAccount: async (userId: string) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
};

// Swap API
export const swapAPI = {
  createRequest: async (requestData: {
    toUserId: string;
    skillOffered: string;
    skillWanted: string;
    proposedDate: string;
    proposedLocation?: string;
    message?: string;
  }) => {
    const response = await api.post('/swaps', requestData);
    return response.data;
  },

  getRequest: async (requestId: string) => {
    const response = await api.get(`/swaps/${requestId}`);
    return response.data;
  },

  acceptRequest: async (requestId: string) => {
    const response = await api.put(`/swaps/${requestId}/accept`);
    return response.data;
  },

  rejectRequest: async (requestId: string) => {
    const response = await api.put(`/swaps/${requestId}/reject`);
    return response.data;
  },

  cancelRequest: async (requestId: string) => {
    const response = await api.put(`/swaps/${requestId}/cancel`);
    return response.data;
  },

  completeSwap: async (requestId: string) => {
    const response = await api.put(`/swaps/${requestId}/complete`);
    return response.data;
  },

  submitFeedback: async (requestId: string, feedback: {
    rating: number;
    comment: string;
  }) => {
    const response = await api.post(`/swaps/${requestId}/feedback`, feedback);
    return response.data;
  },

  getMyRequests: async (params: {
    status?: string;
    type?: 'sent' | 'received';
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get('/swaps', { params });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    role?: string;
  }) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  banUser: async (userId: string, isBanned: boolean) => {
    const response = await api.put(`/admin/users/${userId}/ban`, { isBanned });
    return response.data;
  },

  deleteUser: async (userId: string) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  getRequests: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const response = await api.get('/admin/requests', { params });
    return response.data;
  },

  deleteRequest: async (requestId: string) => {
    const response = await api.delete(`/admin/requests/${requestId}`);
    return response.data;
  },

  createMessage: async (messageData: {
    title: string;
    message: string;
    type?: 'announcement' | 'warning' | 'info';
    expiresAt?: string;
  }) => {
    const response = await api.post('/admin/messages', messageData);
    return response.data;
  },

  getMessages: async (params: {
    page?: number;
    limit?: number;
    active?: boolean;
  }) => {
    const response = await api.get('/admin/messages', { params });
    return response.data;
  },

  updateMessage: async (messageId: string, messageData: {
    title?: string;
    message?: string;
    type?: 'announcement' | 'warning' | 'info';
    expiresAt?: string;
    isActive?: boolean;
  }) => {
    const response = await api.put(`/admin/messages/${messageId}`, messageData);
    return response.data;
  },

  deleteMessage: async (messageId: string) => {
    const response = await api.delete(`/admin/messages/${messageId}`);
    return response.data;
  },

  getReports: async (params: { period?: number }) => {
    const response = await api.get('/admin/reports', { params });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 