import React, { createContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);

  useEffect(() => {
    setIsAuthenticated(!!token);
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');

    if (role) localStorage.setItem('role', role);
    else localStorage.removeItem('role');
  }, [token, role]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.data.success) {
      setToken(res.data.data.token);
      setRole(res.data.data.role);
    }
    return res.data;
  };

  const logout = async () => {
    try {
        await apiLogout();
    } catch(e) {}
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
