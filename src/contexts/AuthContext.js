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

<<<<<<< HEAD
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    const hasBudget = localStorage.getItem('hasBudget');

    
    if (token && userEmail) {
      setIsAuthenticated(true);
      setUserData({ email: userEmail , hasBudget: hasBudget});
=======
  // Проверяем авторизацию при загрузке приложения
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    
    if (token && userEmail) {
      setIsAuthenticated(true);
      setUserData({ email: userEmail });
>>>>>>> c60e653 (авторизация)
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
<<<<<<< HEAD
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const success = email && password.length >= 1;
=======
      // Здесь ваша реальная логика авторизации
      // Пока используем заглушку как в вашем коде
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Симуляция успешной авторизации
      const success = email && password.length >= 1; // Базовая валидация
>>>>>>> c60e653 (авторизация)
      
      if (success) {
        const token = 'fake-jwt-token-' + Date.now();
        localStorage.setItem('authToken', token);
        localStorage.setItem('userEmail', email);
        setIsAuthenticated(true);
<<<<<<< HEAD
        setUserData({ email: email , hasBudget: false });
=======
        setUserData({ email });
>>>>>>> c60e653 (авторизация)
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