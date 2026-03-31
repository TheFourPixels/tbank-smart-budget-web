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
import BudgetCategories from './components/Budget/BudgetCategories/BudgetCategories';
import CreateBudgetForm from './components/Budget/CreateBudget/CreateBudgetForm';
import TransactionsScreen from './components/Transactions/TransactiondScreen';
import BudgetApp from './components/Budget/CreateBudget/CreateBudget';
import Categories from './components/Categories/Categories';
import Trasanctions from './components/Transactions/Transactions';


function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('authToken');
  console.log(isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : children;
}

function BudgetRoute({ children }) {
  const hasBudget = localStorage.getItem('hasBudget');
  return hasBudget ? children : <Navigate to="/create" replace />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <BudgetRoute><Budget/></BudgetRoute>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create" 
            element={
              <ProtectedRoute>
                <BudgetApp/>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create/budget" 
            element={
              <ProtectedRoute>
                <CreateBudgetForm />
              </ProtectedRoute>
            } 
          />
<Route 
            path="/budget/categories" 
            element={
                              <BudgetRoute>

                <BudgetCategories />
                                </BudgetRoute>

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
            path="/transactions" 
            element={
                  <Trasanctions/>
            } 
          />

          <Route 
            path="/categories/create" 
            element={
                <BudgetRoute>
                  <Categories />
                </BudgetRoute>
            } 
          />
          
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <EmailAuthForm />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/login/password" 
            element={
              <PublicRoute>
                <PasswordAuthForm />
              </PublicRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;