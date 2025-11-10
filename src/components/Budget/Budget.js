// components/Budget/Budget.js
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from './Header/Header';
import BudgetCard from './BudgetCard/BudgetCard';
import AccountSelection from './AccountSelection/AccountSelection';
import BudgetSettings from './BudgetSettings/BudgetSettings';

const Budget = () => {
  const { logout, userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app">
      <Header onLogout={handleLogout} userEmail={userData?.email} />
      <div className="app-container">
        <div className="main-content">
          <BudgetCard />
          <div className="content-header">
            <h2 className="main-title">Настройки бюджета</h2>
          </div>
          <div className="content-row">
            <BudgetSettings />
            <AccountSelection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Budget;