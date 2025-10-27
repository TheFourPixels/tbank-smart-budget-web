import React from 'react';
import Header from './components/Header/Header';
import BudgetCard from './components/BudgetCard/BudgetCard';
import AccountSelection from './components/AccountSelection/AccountSelection';
import BudgetSettings from './components/BudgetSettings/BudgetSettings';
import './App.css';

const App = () => {
  return (
    <div className="app">
      <Header />
      <div className="app-container">
        <div className="main-content">
          <BudgetCard />
          
          <div className="content-row">
            <BudgetSettings />
            <AccountSelection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;