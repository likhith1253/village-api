import axios from 'axios';

let apiClientInstance = null;

const createApiClient = () => {
  try {
    const baseURL = import.meta.env?.VITE_API_URL || '';
    
    if (!baseURL && typeof window !== 'undefined') {
      console.warn('VITE_API_URL is not configured. API calls may fail.');
    }

    const instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    instance.interceptors.request.use(
      (config) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const token = localStorage.getItem('census_token');
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          }
        } catch (err) {
          console.error('Error accessing localStorage in request interceptor:', err);
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Prevent redirect loops for demo users or during login attempts
        const token = typeof window !== 'undefined' ? localStorage.getItem('census_token') : null;
        const isDemoUser = token && (token.includes('demo') || token.startsWith('vap_demo'));

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          console.error('INTERCEPTOR KICK:', error.response);
          // If it's a demo user or the request was to the login page, don't redirect
          if (isDemoUser || error.config?.url?.includes('/login')) {
            return Promise.reject(error);
          }
          
          try {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('census_token');
              window.location.href = '/login';
            }
          } catch (err) {
            console.error('Error handling 401/403 response:', err);
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  } catch (error) {
    console.error('Failed to create API client:', error);
    return null;
  }
};

apiClientInstance = createApiClient();

const apiClient = new Proxy({}, {
  get(target, prop) {
    if (!apiClientInstance) {
      console.error('API client is not initialized');
      return () => Promise.reject(new Error('API client not initialized'));
    }
    return apiClientInstance[prop];
  }
});

export default apiClient;
