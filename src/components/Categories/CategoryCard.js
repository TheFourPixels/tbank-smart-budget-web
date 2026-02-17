import React from 'react';
import styles from './CategoryCard.module.css';

const CategoryCard = ({ category, onAmountChange, onCategoryClick, setInputRef }) => {
  const formatAmount = (value) => {
    if (value === 0) return '';
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    onAmountChange(category.id, rawValue);
  };

  const handleBlur = (e) => {
    if (!e.target.value.match(/\d/)) {
      onAmountChange(category.id, 0);
    }
  };

  return (
    <div className={styles.item} onClick={() => onCategoryClick(category.id)}>
      <div className={styles.icon} style={{ backgroundColor: category.color }}></div>
      <span className={styles.name}>{category.name}</span>
      <div className={styles.amountWrapper}>
        <input
          ref={setInputRef}
          type="text"
          className={styles.amount}
          value={formatAmount(category.amount)}
          onChange={handleChange}
          onBlur={handleBlur}
          onClick={(e) => e.stopPropagation()}
          placeholder="0 ₽"
        />
      </div>
    </div>
  );
};

export default CategoryCard;