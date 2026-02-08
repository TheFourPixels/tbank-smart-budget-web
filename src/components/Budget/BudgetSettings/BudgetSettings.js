import React, { useState, useEffect } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import { useNavigate } from 'react-router-dom';
import styles from './BudgetSettings.module.css';
import { budgetService } from '../../../services/BudgetService.js';

const BudgetSettings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categoryMappings = {
    1: { title: "Маркетплейсы", icon: "🛒" },
    2: { title: "Продукты", icon: "🍎" },
    3: { title: "Транспорт", icon: "🚗" },
    4: { title: "Развлечения", icon: "🎬" },
    5: { title: "Коммунальные", icon: "🏠" },
    6: { title: "Здоровье", icon: "🏥" },
    7: { title: "Образование", icon: "📚" },
    8: { title: "Одежда", icon: "👕" }
  };

  useEffect(() => {
    const loadCategoryStats = async () => {
      try {
        setLoading(true);
        
        const savedYear = localStorage.getItem('budgetYear');
        const savedMonth = localStorage.getItem('budgetMonth');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        const year = savedYear ? parseInt(savedYear) : currentYear;
        const month = savedMonth ? parseInt(savedMonth) : currentMonth;
        
        const categoryStats = await budgetService.getCategoryStats(year, month);
        console.log('Category stats:', categoryStats);
        
        const categoriesWithLimits = categoryStats
          .filter(cat => cat && cat.limit > 0)
          .map(cat => {
            const mapping = categoryMappings[cat.id] || { 
              title: `Категория ${cat.id}`, 
              icon: "📁" 
            };
            
            return {
              id: cat.id,
              title: mapping.title,
              spent: cat.spent ? `${Math.round(cat.spent).toLocaleString('ru-RU')} Р` : "0 Р",
              limit: cat.limit ? `${Math.round(cat.limit).toLocaleString('ru-RU')} Р` : "0 Р",
              available: cat.available ? `${Math.round(cat.available).toLocaleString('ru-RU')} Р` : "0 Р",
              icon: mapping.icon,
              progress: cat.progress || 0
            };
          })
          .slice(0, 2);
        
        console.log('Processed categories:', categoriesWithLimits);
        setCategories(categoriesWithLimits);
        
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);

        setCategories([
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
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryStats();
  }, []);

  const handleClick = () => { 
    navigate('/budget/categories');
  };

  if (loading) {
    return (
      <section className={styles.settingsSection}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка категорий...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.settingsSection}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.categoriesTitle}>Категории</h3>
        <button onClick={handleClick} className={styles.viewAllButton}>
          {categories.length === 0 ? 'Настроить категории' : 'Посмотреть все'}
        </button>
      </div>
      
      {categories.length === 0 ? (
  <div className={styles.emptyState}>
    <div className={styles.emptyStateIcon}>
      <svg width="64" height="64" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="22" strokeWidth="2"/>
        <path d="M16 24H32" strokeWidth="2" strokeLinecap="round"/>
        <path d="M24 16V32" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <div className={styles.emptyStateText}>
      <h4 className={styles.emptyStateTitle}>Категории не настроены</h4>
      <p className={styles.emptyStateDescription}>
        Добавьте категории расходов, чтобы отслеживать бюджет по отдельным статьям
      </p>
    </div>
    <button 
      onClick={handleClick}
      className={styles.addCategoriesButton}
    >
      Добавить категории
    </button>
  </div>
) : (
  <div className={styles.categoriesGrid}>
    {categories.map(category => (
      <CategoryCard key={category.id} category={category} />
    ))}
  </div>
      )}
    </section>
  );
};

export default BudgetSettings;