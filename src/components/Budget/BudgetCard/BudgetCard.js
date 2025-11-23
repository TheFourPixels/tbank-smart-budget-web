import React from 'react';
import styles from './BudgetCard.module.css';

const BudgetCard = () => {
  return (
    <section className={styles.budgetSection}>
      <div className={styles.budgetCard}>
        <div className={styles.budgetGradient}></div>
        
        <div className={styles.budgetContent}>
          <div className={styles.budgetMain}>
            <div className={styles.budgetInfo}>
              <h2 className={styles.budgetTitle}>Бюджет "Крутышка"</h2>
              <div className={styles.budgetDetails}>
                <div className={styles.budgetItem}>
                  <span className={styles.budgetLabel}>Баланс</span>
                  <span className={styles.budgetValue}>13 900 Р</span>
                </div>
                <div className={styles.budgetItem}>
                  <span className={styles.budgetLabel}>Срок</span>
                  <span className={styles.budgetValue}>2 месяца</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles.budgetStats}>
            <h3 className={styles.statsTitle}>Информация</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Доход</span>
                <span className={styles.statValue}>12 300 Р</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Общий лимит расходов</span>
                <span className={styles.statValue}>15 400 Р</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Свободные средства</span>
                <span className={styles.statValue}>2 567 Р</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BudgetCard;