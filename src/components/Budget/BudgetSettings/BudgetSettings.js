import React from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import { useNavigate } from 'react-router-dom';
import styles from './BudgetSettings.module.css';

const BudgetSettings = () => {
  const categories = [
    {
      id: 1,
      title: "Маркетплейсы",
      spent: "12 300 Р",
      limit: "15 400 Р",
      available: "2 567 Р",
      icon: "🛒",
      progress: 70
    },
    {
      id: 2,
      title: "Продукты",
      spent: "8 500 Р",
      limit: "10 000 Р",
      available: "1 500 Р",
      icon: "🍎",
      progress: 85
    }
  ];
  const navigate = useNavigate();

  const handleClick = () => { navigate('budget/categories') };  


  return (
    <section className={styles.settingsSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.categoriesTitle}>Категории</h3>
        <button onClick={handleClick} className={styles.viewAllButton}>Посмотреть все</button>
      </div>
      <div className={styles.categoriesGrid}>
        {categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
};

export default BudgetSettings;