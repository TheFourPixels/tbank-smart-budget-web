import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApiService } from '../services/AuthService';
import { budgetApiService, transactionApiService } from '../services/ApiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  const setAuthHeader = (token) => {
    if (token) {
      budgetApiService.setAuthToken(token);
      transactionApiService.setAuthToken(token);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authApiService.login(email, password);
      const receivedToken = data.token;

      if (receivedToken) {
        localStorage.setItem('authToken', receivedToken);
        console.log('Токен: ' + receivedToken);
        setToken(receivedToken);
        setAuthHeader(receivedToken);

        const profile = await authApiService.getProfile(receivedToken);
        setUser(profile);
        return { success: true };
      }
    } catch (error) {
      return { success: false, error: error.message || 'Ошибка входа' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('authToken');
      if (savedToken) {
        setToken(savedToken);
        setAuthHeader(savedToken);
        try {
          const profile = await authApiService.getProfile(savedToken);
          setUser(profile);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};