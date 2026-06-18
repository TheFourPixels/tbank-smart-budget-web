import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApiService } from '../services/AuthService';
import { budgetApiService, transactionApiService, goalApiService, dashboardApiService } from '../services/ApiService';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);

  const setAuthHeader = (newToken) => {
    budgetApiService.setAuthToken(newToken);
    transactionApiService.setAuthToken(newToken);
    goalApiService.setAuthToken(newToken);
    dashboardApiService.setAuthToken(newToken);
    authApiService.setAuthToken(newToken);
  };

  const applySession = async (receivedToken) => {
    localStorage.setItem('authToken', receivedToken);
    setToken(receivedToken);
    setAuthHeader(receivedToken);

    try {
      const profile = await authApiService.getProfile(receivedToken);
      setUser(profile);
    } catch (error) {
      // Профиль не критичен для входа — продолжаем без него
      setUser(null);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await authApiService.login(email, password);
      const receivedToken = data?.token;

      if (!receivedToken) {
        return { success: false, error: 'Сервер не вернул токен авторизации' };
      }

      await applySession(receivedToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error?.message || 'Ошибка входа' };
    }
  };

  const register = async (email, password, name) => {
    try {
      const data = await authApiService.register(email, password, name);
      const receivedToken = data?.token;

      if (receivedToken) {
        await applySession(receivedToken);
        return { success: true };
      }

      // Если регистрация не возвращает токен сразу — просим войти
      return { success: true, requiresLogin: true };
    } catch (error) {
      return { success: false, error: error?.message || 'Ошибка регистрации' };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    userData: user,
    token,
    isAuthenticated: Boolean(token),
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
