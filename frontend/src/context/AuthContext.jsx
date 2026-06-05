import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

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
      try {
        const response = await apiClient.get('/users/me');
        setUser(response.data.data);
      } catch (err) {
        localStorage.removeItem('census_token');
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { token, user: userData } = response.data.data;
    localStorage.setItem('census_token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('census_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
