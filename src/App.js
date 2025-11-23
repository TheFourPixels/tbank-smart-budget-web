// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import EmailAuthForm from './components/Auth/AuthForm/EmailAuthForm';
import PasswordAuthForm from './components/Auth/AuthForm/PasswordAuthForm';
import CategoriesPage from './components/Categories/CategoriesPage';
import Budget from './components/Budget/Budget';
import './App.css';
import CreateCategoryPage from './components/CreateCategory/CreateCategoryPage';
import CreateBudgetInfo from './components/Budget/CreateBudget/CreateBudgetInfo';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : children;
  //<Navigate to="/" replace />;
}

function BudgetRoute({ children }) {
  const hasBudget = localStorage.getItem('hasBudget');
  return hasBudget ? children : <Navigate to="/create"/>;
  //<Navigate to="/" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Главный экран - защищенный */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <BudgetRoute><Budget/></BudgetRoute>
              </ProtectedRoute>
            } 
          />
          {/* Создание бюджета */}
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <CreateBudgetInfo />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/categories" 
            element={
                <BudgetRoute>
                  <CategoriesPage />
                </BudgetRoute>
            } 
          />

          <Route 
            path="/categories/create" 
            element={
                <BudgetRoute>
                  <CreateCategoryPage />
                </BudgetRoute>
            } 
          />
          
          {/* Страница ввода email - только для неавторизованных */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <EmailAuthForm />
              </PublicRoute>
            } 
          />
          
          {/* Страница ввода пароля - только для неавторизованных */}
          <Route 
            path="/login/password" 
            element={
              <PublicRoute>
                <PasswordAuthForm />
              </PublicRoute>
            } 
          />
          
          {/* Редирект для всего остального*/}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;