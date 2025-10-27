import React from 'react';
import styles from './AccountSelection.module.css';

const AccountSelection = () => {
  return (
    <section className={styles.accountSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.categoriesTitle}>Настройки бюджета</h3>
      </div>
      <div className={styles.accountCard}>
        {/* Секция срока вклада (без заголовка) */}
        <div className={styles.durationSection}>
          <div className={styles.durationOptions}>
            <button className={`${styles.durationButton} ${styles.active}`}>2 мес</button>
            <button className={styles.durationButton}>3 мес</button>
            <button className={styles.durationButton}>4 мес</button>
            <button className={styles.durationButton}>6 мес</button>
            <button className={styles.durationButton}>Другой срок</button>
          </div>
        </div>
        
        {/* Секция суммы вклада (без заголовка) */}
        <div className={styles.amountSection}>
          <div className={styles.amountCard}>
            <span className={styles.amountValue}>13 900 Р</span>
          </div>
          <p className={styles.amountNote}>Мы берем 13 900 отсюда</p>
        </div>
        
        {/* Секция выбора счета */}
        <div className={styles.accountsSection}>
          <div className={styles.accountsGrid}>
            <div className={styles.bankCard}>
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardChip}></div>
                </div>
                <div className={styles.cardNumber}>• 8563</div>
                <div className={styles.cardBalance}>36 000 ₽</div>
                <div className={styles.cardType}>Дебетовая карта</div>
              </div>
            </div>
            <div className={styles.changeCard}>
              <div className={styles.changeCardContent}>
                <div className={styles.changeIcon}>+</div>
                <div className={styles.changeText}>Изменить счет</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountSelection;