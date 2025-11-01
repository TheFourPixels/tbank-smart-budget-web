// contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const hasBudget = localStorage.getItem('hasBudget');

    
    if (token && userEmail) {
      setIsAuthenticated(true);
      setUserData({ email: userEmail , hasBudget: hasBudget});
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = email && password.length >= 1;
      
      if (success) {
        const token = 'fake-jwt-token-' + Date.now();
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', email);
        setIsAuthenticated(true);
        setUserData({ email: email , hasBudget: false });
        return { success: true };
      } else {
        return { success: false, error: 'Неверные учетные данные' };
      }
    } catch (error) {
      return { success: false, error: 'Ошибка сети' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserData(null);
  };

  const value = {
    isAuthenticated,
    userData,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}