import React, { useState, useEffect } from 'react';
import { budgetService } from '../../../services/BudgetService.js';
import styles from './AccountSelection.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ru-RU').format(amount) + ' Р';
};

const AccountSelection = () => {
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

        const data = await budgetService.getBudgetSummary(year, month);
        setBudgetData(data);

      } catch (error) {
        console.error('Ошибка загрузки данных бюджета:', error);
        setError('Не удалось загрузить данные бюджета.');

        // Пробуем загрузить из localStorage
        const savedData = {
          balance: parseFloat(localStorage.getItem('budgetLimit') || 0),
          freeMoney: parseFloat(localStorage.getItem('budgetFreeMoney') || 0)
        };

        if (savedData.balance > 0 || savedData.freeMoney > 0) {
          setBudgetData(savedData);
        }
      } finally {
        setLoading(false);
      }
    };

    loadBudgetData();
  }, []);

  // Состояние загрузки
  if (loading) {
    return (
      <section className={styles.accountSection}>
        <div className={styles.sectionHeader}></div>
        <div className={styles.accountCard}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Загрузка данных...</p>
          </div>
        </div>
      </section>
    );
  }

  // Определяем сумму для списания
  // Используем freeMoney если есть, иначе balance
  const amountToCharge = budgetData?.freeMoney || budgetData?.balance || 0;

  return (
    <section className={styles.accountSection}>
      <div className={styles.sectionHeader}>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
      <div className={styles.accountCard}>
        <div className={styles.durationSection}>
          <div className={styles.durationOptions}>
            <button className={`${styles.durationButton} ${styles.active}`}>1 мес</button>
            <button className={styles.durationButton}>3 мес</button>
            <button className={styles.durationButton}>4 мес</button>
            <button className={styles.durationButton}>6 мес</button>
            <button className={styles.durationButton}>Другой срок</button>
          </div>
        </div>

        <div className={styles.amountSection}>
          <div className={styles.amountCard}>
            {amountToCharge > 0 ? (
              <span className={styles.amountValue}>{formatCurrency(amountToCharge)}</span>
            ) : (
              <span className={styles.amountValue}>0 Р</span>
            )}
          </div>
          <p className={styles.amountNote}>
            Мы берем {formatCurrency(amountToCharge)} отсюда
          </p>
        </div>

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
