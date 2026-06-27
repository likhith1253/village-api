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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('census_token');
      if (!token) {
        setLoading(false);
        return;
      }
      // Check if this is a demo user bypass token
      if (token === 'demo_override_token') {
        setUser(DEMO_USER);
        setLoading(false);
        return;
      }
      try {
        const response = await apiClient.get('/api/users/me');
        setUser(response.data.data);
      } catch (err) {
        localStorage.removeItem('census_token');
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

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
