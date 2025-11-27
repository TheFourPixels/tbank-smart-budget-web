import React, { useState, useEffect } from 'react';
import styles from './BudgetCard.module.css';

const mockBudgetData = {
  title: 'Бюджет "Крутышка"',
  balance: 13900,
  period: '2 месяца',
  income: 12300,
  expenseLimit: 15400,
  freeMoney: 2567
};

const fetchBudgetData = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve(mockBudgetData);
  }, 100); 
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' Р';
};

const BudgetCard = () => {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBudgetData = async () => {
      try {
        const data = await fetchBudgetData();
        setBudgetData(data);
      } catch (error) {
        console.error('Ошибка загрузки данных бюджета:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBudgetData();
  }, []);

  if (loading) {
    return <div className={styles.budgetSection}>Загрузка...</div>;
  }

  if (!budgetData) {
    return <div className={styles.budgetSection}>Ошибка загрузки данных</div>;
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