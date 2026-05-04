import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useBudget } from '../../hooks/useBudget';
import { transactionService } from '../../services/transactionService';
import { goalService } from '../../services/goalService';
import PlanVsFactWidget from './PlanVsFactWidget';
import CategoriesWidget from './CategoriesWidget';
import GoalsWidget from './GoalsWidget';
import './DashboardPage.css';

const DashboardPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categorySpending, setCategorySpending] = useState([]);
  const [goalsData, setGoalsData] = useState({ completed: [], active: [] });
  
  const { dashboardData, loading: dashboardLoading, error: dashboardError, fetchDashboardData } = useDashboard();
  const { budget, loading: budgetLoading, error: budgetError, getCurrentBudget } = useBudget();

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    fetchDashboardData(year, month);
    getCurrentBudget();
    loadAdditionalData(year, month);
  }, [currentDate]);

  const loadAdditionalData = async (year, month) => {
    try {
      // Загрузка данных по категориям
      const spendingData = await transactionService.getCategorySpending(year, month);
      setCategorySpending(spendingData);
      
      // Загрузка данных по целям
      const [completedGoals, activeGoals] = await Promise.all([
        goalService.listCompleted(year, month),
        goalService.listActive(year, month)
      ]);
      
      setGoalsData({
        completed: completedGoals || [],
        active: activeGoals || []
      });
    } catch (error) {
      console.error('Ошибка загрузки дополнительных данных:', error);
    }
  };

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  if (dashboardLoading || budgetLoading) {
    return <div className="dashboard-loading">Загрузка данных...</div>;
  }

  if (dashboardError || budgetError) {
    return (
      <div className="dashboard-error">
        Ошибка загрузки данных: {dashboardError?.message || budgetError?.message}
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <section id="section-header">
        <header className="site-header">
          <div className="header-container">
            <img src="/assets/logo.svg" alt="Logo" className="logo" />
            <nav className="main-nav">
              <a href="#">Главная</a>
              <a href="#plan-vs-fact">Бюджет</a>
              <a href="#categories">Транзакции</a>
              <a href="#goals">Цели</a>
            </nav>
            <div className="user-profile">
              <span className="user-name">Александр</span>
              <img
                src="/assets/avatar.png"
                alt="User Avatar"
                className="avatar"
              />
            </div>
          </div>
        </header>
        <h1 className="page-title">Статистика</h1>
      </section>

      <section id="plan-vs-fact" className="container">
        <PlanVsFactWidget 
          dashboardData={dashboardData}
          budget={budget}
          currentDate={currentDate}
          onDateChange={handleDateChange}
        />
      </section>

      <section id="categories" className="container">
        <CategoriesWidget 
          dashboardData={dashboardData}
          categorySpending={categorySpending}
          currentDate={currentDate}
        />
      </section>

      <section id="goals" className="container">
        <GoalsWidget 
          goalsData={goalsData}
          currentDate={currentDate}
        />
      </section>
    </div>
  );
};

export default DashboardPage;
