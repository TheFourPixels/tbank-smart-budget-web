import React from 'react';
import styles from './StatsCard.module.css';

const StatsCard = ({ income, expense, balance, period, onPeriodChange }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' ₽';
  };

  const periods = [
    { id: 'day', label: 'День' },
    { id: 'week', label: 'Неделя' },
    { id: 'month', label: 'Месяц' },
    { id: 'year', label: 'Год' }
  ];

  return (
    <div className={styles.card}>
      <div className={styles.periodSelector}>
        {periods.map(p => (
          <button
            key={p.id}
            className={`${styles.periodButton} ${period === p.id ? styles.active : ''}`}
            onClick={() => onPeriodChange(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Доходы</span>
          <span className={styles.incomeValue}>{formatCurrency(income)}</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Расходы</span>
          <span className={styles.expenseValue}>{formatCurrency(expense)}</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Баланс</span>
          <span className={styles.balanceValue}>{formatCurrency(balance)}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;