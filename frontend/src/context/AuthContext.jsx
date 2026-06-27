import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

const DEMO_USER = {
  id: 'demo-recruiter-999',
  name: 'Demo Account (Premium)',
  email: 'demo@censusgrid.com',
  role: 'ADMIN',
  plan: 'PRO',
  isDemo: true,
  subscriptionStatus: 'active',
  subscriptionEndDate: '2099-12-31T23:59:59.000Z',
  apiKeys: [
    {
      id: 'demo-key-id-123',
      name: 'Default Demo Key',
      key: 'vap_demo_xxxxxxxxxxxxxxxxxxxxxxxx',
      isActive: true,
      createdAt: new Date().toISOString(),
    }
  ]
};

const getInitialState = () => {
  try {
    const token = localStorage.getItem('census_token');
    if (token === 'demo_override_token') {
      return { user: DEMO_USER, loading: false };
    }
    // For real users, we need to verify the token with the backend
    if (token) {
      return { user: null, loading: true };
    }
    // No token, not loading
    return { user: null, loading: false };
  } catch (error) {
    console.error("Failed to get initial auth state from localStorage", error);
    return { user: null, loading: false };
  }
};

export const AuthProvider = ({ children }) => {
  const initialState = getInitialState();
  const [user, setUser] = useState(initialState.user);
  const [loading, setLoading] = useState(initialState.loading);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('census_token');
      // If there's no token or it's a demo token, we've already handled it in getInitialState.
      if (!token || token === 'demo_override_token') {
        return;
      }

      try {
        const response = await apiClient.get('/api/users/me');
        setUser(response.data.data);
      } catch (err) {
        // This can happen if the token is invalid/expired
        localStorage.removeItem('census_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    // Only run auth check if we are in a loading state (i.e., for a real user with a token)
    if (loading) {
      checkAuthStatus();
    }
  }, [loading]);

  const refreshUser = async () => {
    const token = localStorage.getItem('census_token');
    if (!token) return null;
    // Check if this is a demo user bypass token
    if (token === 'demo_override_token') {
      setUser(DEMO_USER);
      return DEMO_USER;
    }
    try {
      const response = await apiClient.get('/api/users/me');
      setUser(response.data.data);
      return response.data.data;
    } catch (err) {
      localStorage.removeItem('census_token');
      setUser(null);
      return null;
    }
  };

  const login = async (email, password) => {
    const response = await apiClient.post('/api/auth/login', { email, password });
    const { token, user: userData } = response.data.data;
    localStorage.setItem('census_token', token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await apiClient.post('/api/auth/register', { name, email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('census_token');
    setUser(null);
  };

  const loginAsDemo = () => {
    localStorage.setItem('census_token', 'demo_override_token');
    localStorage.removeItem('tour_completed');
    setUser(DEMO_USER);
    return DEMO_USER;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
