import styles from './AccountSelection.module.css';
import React, { useState, useEffect } from 'react';
import { budgetService } from '../../../services/BudgetService.js';

function AccountSelection () {
  const [budgetData, setBudgetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    useEffect(() => {
      const loadBudgetData = async () => {
        try {
          setLoading(true);
          setError(null);
          const savedYear = localStorage.getItem('budgetYear');
          const savedMonth = localStorage.getItem('budgetMonth');
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          
          const year = savedYear ? parseInt(savedYear) : currentYear;
          const month = savedMonth ? parseInt(savedMonth) : currentMonth;
          
          const data = await budgetService.getBudget(year, month);
          console.log(data);
          setBudgetData(data);
          
        } catch (error) {
          console.error('Ошибка загрузки данных бюджета:', error);
          setError('Не удалось загрузить данные бюджета. Проверьте подключение к интернету.');
          
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

  return (
    <section className={styles.accountSection}>
      <div className={styles.sectionHeader}>
      </div>
      <div className={styles.accountCard}>
        {/* Секция срока вклада (без заголовка) */}
        <div className={styles.durationSection}>
          <div className={styles.durationOptions}>
            <button className={`${styles.durationButton} ${styles.active}`}>1 мес</button>
            <button className={styles.durationButton}>2 мес</button>
            <button className={styles.durationButton}>4 мес</button>
            <button className={styles.durationButton}>6 мес</button>
            <button className={styles.durationButton}>Другой срок</button>
          </div>
        </div>
        
        {/* Секция суммы вклада (без заголовка) */}
        <div className={styles.amountSection}>
          <div className={styles.amountCard}>
            <span className={styles.amountValue}>{budgetData?.total_income ?? 0} Р</span>
          </div>
          <p className={styles.amountNote}>Мы берем {budgetData?.total_income ?? 0} отсюда</p>
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
                <div className={styles.cardBalance}>{budgetData?.total_income ?? 0} ₽</div>
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