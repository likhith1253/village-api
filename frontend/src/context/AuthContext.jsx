import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

const AuthContext = createContext(null);

const getInitialState = () => {
  try {
    const token = localStorage.getItem('census_token');
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
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // The backend will validate the token and return the user
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

    // Only run auth check if we are in a loading state (i.e., for a user with a token)
    if (loading) {
      checkAuthStatus();
    }
  }, [loading]);

  const refreshUser = async () => {
    const token = localStorage.getItem('census_token');
    if (!token) return null;
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
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await apiClient.post('/api/auth/register', { name, email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('census_token');
    delete apiClient.defaults.headers.Authorization;
    setUser(null);
  };

  const loginAsDemo = async () => {
    try {
      const response = await apiClient.post('/api/auth/demo-login');
      const { token, user: demoUserData } = response.data.data;
      localStorage.setItem('census_token', token);
      apiClient.defaults.headers.Authorization = `Bearer ${token}`;
      setUser(demoUserData);
      return demoUserData;
    } catch (error) {
      console.error("Demo login failed:", error);
      // Optional: handle demo login failure gracefully
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
