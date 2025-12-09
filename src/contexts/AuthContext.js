import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail') || 'Пользователь';
    const hasBudget = localStorage.getItem('hasBudget') === 'true';
    
    setUserData({ 
      email: userEmail, 
      hasBudget 
    });
  }, []);

  const login = async (email, password) => {
    localStorage.setItem('userEmail', email);
    setIsAuthenticated(true);
    setUserData({ 
      email, 
      hasBudget: localStorage.getItem('hasBudget') === 'true' 
    });
    
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('userEmail');
    setUserData(null);
    setIsAuthenticated(false);
  };

  const updateBudgetStatus = (hasBudget) => {
    localStorage.setItem('hasBudget', hasBudget.toString());
    setUserData(prev => prev ? { ...prev, hasBudget } : null);
  };

  const value = {
    isAuthenticated,
    userData,
    login,
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