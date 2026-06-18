import React from 'react';
import Header from './Header/Header';
import BudgetCard from './BudgetCard/BudgetCard';
import AccountSelection from './AccountSelection/AccountSelection';
import BudgetSettings from './BudgetSettings/BudgetSettings';

const Budget = () => {
  return (
    <div className="app">
      <Header />
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
