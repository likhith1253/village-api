import apiClient from './apiClient.js';

export const authService = {
  async login(email, password) {
    try {
      if (!apiClient) {
        throw new Error('API client not initialized');
      }
      const response = await apiClient.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    }
  },

  async register(name, email, password) {
    try {
      if (!apiClient) {
        throw new Error('API client not initialized');
      }
      const response = await apiClient.post('/api/auth/register', { name, email, password });
      return response.data;
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      if (!apiClient) {
        throw new Error('API client not initialized');
      }
      const response = await apiClient.get('/api/users/me');
      return response.data;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }
};

export default authService;
