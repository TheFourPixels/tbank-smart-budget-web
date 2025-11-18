import React from 'react';
import styles from './CategoryCard.module.css';

const CategoryCard = ({ category }) => {
  return (
    <div className={styles.categoryCard}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryIcon}>
          <span className={styles.icon}>{category.icon}</span>
        </div>
        <div className={styles.categoryInfo}>
          <h4 className={styles.categoryTitle}>{category.title}</h4>
          <button className={styles.editButton}>Редактировать</button>
        </div>
      </div>
      
      <div className={styles.progressSection}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{width: `${category.progress}%`}}
          ></div>
        </div>
        <div className={styles.progressText}>
          <span>Использовано {category.progress}%</span>
        </div>
      </div>
      
      <div className={styles.categoryStats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Потрачено</span>
          <span className={styles.statValue}>{category.spent}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Лимит</span>
          <span className={styles.statValue}>{category.limit}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Свободно</span>
          <span className={styles.statValue}>{category.available}</span>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;