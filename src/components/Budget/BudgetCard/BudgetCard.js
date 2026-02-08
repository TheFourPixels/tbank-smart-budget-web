import React, { useState, useEffect } from 'react';
import { budgetService } from '../../../services/BudgetService.js';
import styles from './BudgetCard.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' Р';
};

const BudgetCard = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBudgetData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Получаем период из localStorage или используем текущий
        const savedYear = localStorage.getItem('budgetYear');
        const savedMonth = localStorage.getItem('budgetMonth');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        const year = savedYear ? parseInt(savedYear) : currentYear;
        const month = savedMonth ? parseInt(savedMonth) : currentMonth;
        
        // Загружаем данные бюджета
        const data = await budgetService.getBudgetSummary(year, month);
        console.log(data);
        setBudgetData(data);
        
      } catch (error) {
        console.error('Ошибка загрузки данных бюджета:', error);
        setError('Не удалось загрузить данные бюджета. Проверьте подключение к интернету.');
        
        // Загружаем из localStorage как fallback
        const savedData = {
          title: localStorage.getItem('budgetName') || 'Мой бюджет',
          balance: parseFloat(localStorage.getItem('budgetLimit') || 0),
          period: localStorage.getItem('budgetPeriod') || 'Текущий месяц',
          income: parseFloat(localStorage.getItem('budgetLimit') || 0),
          expenseLimit: parseFloat(localStorage.getItem('budgetExpenseLimit') || 0),
          freeMoney: parseFloat(localStorage.getItem('budgetFreeMoney') || 0)
        };
        
        if (savedData.balance > 0) {
          setBudgetData(savedData);
          setError('Данные загружены из кеша. Некоторые данные могут быть устаревшими.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadBudgetData();
  }, []);

  if (loading) {
    return (
      <section className={styles.budgetSection}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка данных бюджета...</p>
        </div>
      </section>
    );
  }

  if (error && !budgetData) {
    return (
      <section className={styles.budgetSection}>
        <div className={styles.errorContainer}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="#FFEBEE"/>
            <path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" stroke="#F44336" strokeWidth="2"/>
            <path d="M24 16V28" stroke="#F44336" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="24" cy="32" r="2" fill="#F44336"/>
          </svg>
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
          <button 
            className={styles.retryButton}
            onClick={() => window.location.reload()}
          >
            Повторить попытку
          </button>
        </div>
      </section>
    );
  }

  if (!budgetData) {
    return (
      <section className={styles.budgetSection}>
        <div className={styles.emptyContainer}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#EAEAEA" strokeWidth="2"/>
            <path d="M32 22V42" stroke="#EAEAEA" strokeWidth="2" strokeLinecap="round"/>
            <path d="M22 32H42" stroke="#EAEAEA" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3>Бюджет не создан</h3>
          <p>Создайте свой первый бюджет, чтобы начать отслеживать расходы</p>
          <button 
            className={styles.createButton}
            onClick={() => window.location.href = '/budget/create'}
          >
            Создать бюджет
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.budgetSection}>
      <div className={styles.budgetCard}>
        <div className={styles.budgetGradient}></div>
        
        <div className={styles.budgetContent}>
          <div className={styles.budgetMain}>
            <div className={styles.budgetInfo}>
              <h2 className={styles.budgetTitle}>{budgetData.title}</h2>
              <div className={styles.budgetDetails}>
                <div className={styles.budgetItem}>
                  <span className={styles.budgetLabel}>Баланс</span>
                  <span className={styles.budgetValue}>
                    {formatCurrency(budgetData.balance)}
                  </span>
                </div>
                <div className={styles.budgetItem}>
                  <span className={styles.budgetLabel}>Срок</span>
                  <span className={styles.budgetValue}>{budgetData.period}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.budgetStats}>
            <h3 className={styles.statsTitle}>Информация</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Доход</span>
                <span className={styles.statValue}>
                  {formatCurrency(budgetData.income)}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Общий лимит расходов</span>
                <span className={styles.statValue}>
                  {formatCurrency(budgetData.expenseLimit)}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Свободные средства</span>
                <span className={styles.statValue}>
                  {formatCurrency(budgetData.freeMoney)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetCard;