import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken?.();
    const userEmail = localStorage.getItem('userEmail');
    const hasBudget = localStorage.getItem('hasBudget');

    if (token && userEmail) {
      setIsAuthenticated(true);
      setUserData({ email: userEmail, hasBudget: hasBudget === 'true' });
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authService.login(email, password);
      
      localStorage.setItem('userEmail', email);
      
      const hasBudget = localStorage.getItem('hasBudget') === 'true';
      
      setIsAuthenticated(true);
      setUserData({ email, hasBudget });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Ошибка авторизации' 
      };
    }
  };

  const register = async (email, password) => {
    try {
      const data = await authService.register(email, password);
      
      localStorage.setItem('userEmail', email);
      
      setIsAuthenticated(true);
      setUserData({ email, hasBudget: false });
      
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Ошибка регистрации' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('userEmail');
      setIsAuthenticated(false);
      setUserData(null);
    }
  };

  const updateBudgetStatus = (hasBudget) => {
    localStorage.setItem('hasBudget', hasBudget.toString());
    setUserData(prev => prev ? { ...prev, hasBudget } : null);
  };

  const value = {
    isAuthenticated,
    userData,
    login,
    register,
    logout,
    updateBudgetStatus,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}