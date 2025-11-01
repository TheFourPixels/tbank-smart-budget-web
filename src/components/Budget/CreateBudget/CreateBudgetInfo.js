import React from 'react';
import styles from './CreateBudgetInfo.module.css';
import Header from '../Header/Header';

const CreateBudgetInfo = () => {
  const handleCreateBudget = () => {
  };

  const budgetFeatures = [
    "Возможность грамотно распоряжаться своими финансами",
    "Способ видеть свои доходы и расходы",
    "Помощник в постановке целей",
    "Инструмент для предотвращения импульсивных покупок",
    "Система приоритетов для распределения средств",
    "Финансовый план на определенный период"
  ];

  return (
    <div>
        <Header/>
    <div className={styles.mainContent}>
      <div className={styles.container}>
        <h1 className={styles.title}>Добрый день, создайте свой первый бюджет</h1>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>Бюджет - это:</h2>
            <ul className={styles.featuresList}>
              {budgetFeatures.map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  {feature}
                </li>
              ))}
            </ul>
            <button 
              className={styles.createButton}
              onClick={handleCreateBudget}
            >
              Создать бюджет
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CreateBudgetInfo;