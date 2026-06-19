import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const demoUserTemplate = {
    id: 'demo-recruiter-999',
    name: 'Demo Account (Premium)',
    email: 'demo@censusgrid.com',
    role: 'USER',
    plan: 'PRO',
    isDemo: true
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('census_token');
      if (!token) {
        setLoading(false);
        return;
      }
      // Check if this is a demo user bypass token
      if (token === 'demo_override_token') {
        setUser(demoUserTemplate);
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
      setUser(demoUserTemplate);
      return demoUserTemplate;
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
    setUser(demoUserTemplate);
    return demoUserTemplate;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
