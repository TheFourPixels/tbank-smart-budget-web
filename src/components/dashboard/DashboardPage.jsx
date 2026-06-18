import React, { useState, useEffect, useCallback } from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { useBudget } from '../../hooks/useBudget';
import { budgetService } from '../../services/BudgetService';
import { transactionService } from '../../services/TransactionService';
import { goalService } from '../../services/goalService';
import PlanVsFactWidget from './PlanVsFactWidget';
import CategoriesWidget from './CategoriesWidget';
import GoalsWidget from './GoalsWidget';
import Header from '../Budget/Header/Header';
import './DashboardPage.css';

const DashboardPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categorySpending, setCategorySpending] = useState([]);
  const [goalsData, setGoalsData] = useState({ completed: [], active: [] });
  
  const { dashboardData, loading: dashboardLoading, error: dashboardError, fetchDashboardData } = useDashboard();
  const { budget, loading: budgetLoading, error: budgetError, getCurrentBudget } = useBudget();

  const loadAdditionalData = useCallback(async (year, month) => {
    try {
      // Загрузка данных по категориям (метод находится в BudgetService,
      // а не в TransactionService — раньше вызов падал с ошибкой)
      const spendingData = await budgetService.getCategorySpending(year, month);
      setCategorySpending(spendingData || []);

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
      setCategorySpending([]);
      setGoalsData({ completed: [], active: [] });
    }
  }, []);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    // Убедимся, что токен установлен для всех сервисов
    const token = localStorage.getItem('authToken');
    if (token) {
      transactionService.setAuthToken(token);
      goalService.setAuthToken(token);
    }
    
    fetchDashboardData(year, month);
    getCurrentBudget();
    loadAdditionalData(year, month);
  }, [currentDate, fetchDashboardData, getCurrentBudget, loadAdditionalData]);

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  if (dashboardLoading || budgetLoading) {
    return <div className="dashboard-loading">Загрузка данных...</div>;
  }

  if (dashboardError || budgetError) {
    return (
      <div className="dashboard-error">
        Ошибка загрузки данных: {dashboardError?.message || budgetError?.message || 'Неизвестная ошибка'}
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Header />

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
