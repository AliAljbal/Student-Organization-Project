// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      const res = await api.post('users/login/', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setUser(user);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      const res = await api.get('users/profile/');
      setUser(res.data);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
