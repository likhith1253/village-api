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
        const originalRequest = error.config;
        
        // Check if the failure belongs to an authorized route or requires interception
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
          console.error("[API Interceptor] Auth failure caught:", error.response.status, originalRequest.url);
          
          // If it is a demo user session, do not force a hard login redirect; bubble the error to the view layer
          const isDemo = localStorage.getItem('isDemoUser') === 'true' || JSON.parse(localStorage.getItem('user') || '{}').isDemo;
          if (isDemo) {
            console.warn("[API Interceptor] Demo user session context retained. Bypassing forced redirection.");
            return Promise.reject(error);
          }
          
          // Standard fallback redirection for expired authentications
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?expired=true';
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
