import React, { useState } from 'react';
import styles from './TransactionItem.module.css';

const TransactionItem = ({ transaction, onCategoryChange }) => {
  const { description, amount, category, date } = transaction;
  const [isPressed, setIsPressed] = useState(false);
  
  const isExpense = amount < 0;
  const formattedAmount = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(amount));

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Генерация инициалов из названия категории
  const getCategoryInitials = (categoryName) => {
    if (!categoryName) return '?';
    
    const words = categoryName.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return categoryName.substring(0, 2).toUpperCase();
  };

  const handlePressStart = () => {
    setIsPressed(true);
  };

  const handlePressEnd = () => {
    setIsPressed(false);
  };

  return (
    <div 
      className={`${styles.container} ${isPressed ? styles.pressed : ''}`}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
    >
      <div 
        className={styles.iconContainer}
        style={{ 
          backgroundColor: category?.color || '#667eea',
          color: '#fff',
          fontWeight: '600',
          fontSize: '14px'
        }}
        title={category?.name || 'Без категории'}
      >
        {getCategoryInitials(category?.name || '??')}
      </div>
      
      <div className={styles.content}>
        <div className={styles.mainInfo}>
          <div className={styles.descriptionWrapper}>
            <span className={styles.description}>{description}</span>
            <span className={styles.time}>{formatTime(date)}</span>
          </div>
          <span className={`${styles.amount} ${isExpense ? styles.expense : styles.income}`}>
            {isExpense ? '−' : '+'} {formattedAmount} ₽
          </span>
        </div>
        
        <div className={styles.categoryInfo}>
          <span className={styles.category}>{category?.name || 'Без категории'}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;