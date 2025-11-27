import React, { useState } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import styles from './BudgetCategories.module.css';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';

const BudgetCategories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      icon: '🍎',
      title: 'Продукты',
      progress: 80,
      spent: '12 300 Р',
      limit: '15 400 Р',
      available: '2 567 Р'
    },
    {
      id: 2,
      icon: '🛒',
      title: 'Маркетплейсы',
      progress: 60,
      spent: '12 300 Р',
      limit: '15 400 Р',
      available: '2 567 Р'
    },
    {
      id: 3,
      icon: '🚗',
      title: 'Транспорт',
      progress: 45,
      spent: '12 300 Р',
      limit: '15 400 Р',
      available: '2 567 Р'
    }
  ]);

  const [selectedCategories, setSelectedCategories] = useState([
    { id: 1, icon: '🍎', title: 'Продукты' },
    { id: 2, icon: '🛒', title: 'Маркетплейсы' }
  ]);

  const handleEditCategory = (categoryId) => {
    // Логика редактирования категории
    console.log('Редактировать категорию:', categoryId);
  };

    const navigate = useNavigate();

  const handleClick = () => { navigate('/categories') };  

  return (
    <div className={styles.container}>
      <Header/>

      {/* Main Content */}
      <main className={styles.main}>
        <h1 className={styles.title}>Категории</h1>
        <div className={styles.contentGrid}>
          <section className={styles.selectedCategories}>
            <h2 className={styles.sectionTitle}>Выбранные категории</h2>
            <div className={styles.categoryIcons}>
              {selectedCategories.map(category => (
                <div key={category.id} className={styles.categoryIcon}>
                  <div className={styles.iconCircle}>
                    <span className={styles.icon}>{category.icon}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={handleClick} className={styles.addCategoryBtn}>Добавить категорию</button>
          </section>

          <section className={styles.budgetChart}>
            <div className={styles.chartHeader}>
              <h2 className={styles.sectionTitle}>Бюджет по категориям</h2>
              <button className={styles.chartNavBtn}>
                <svg width="7" height="11" viewBox="0 0 7 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5.01521 5.01521L1 9.03042" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className={styles.chartContainer}>
              <div className={styles.pieChart}>
                <div className={styles.chartOuter}>
                  <div className={styles.chartInner}>
                    <span className={styles.chartAmount}>20000 ₽</span>
                    <span className={styles.chartLabel}>Траты</span>
                  </div>
                </div>
              </div>
              <div className={styles.chartLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor}></div>
                  <span className={styles.legendText}>20000 ₽</span>
                </div>
                <div className={styles.legendItem}>
                  <div className={styles.legendColor}></div>
                  <span className={styles.legendText}>Другое</span>
                </div>
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section className={styles.statisticsSection}>
            <h2 className={styles.sectionTitle}>Статистика по категориям</h2>
            <div className={styles.statisticsGrid}>
              {categories.map(category => (
                <CategoryCard 
                  key={category.id} 
                  category={category}
                  onEdit={() => handleEditCategory(category.id)}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BudgetCategories;