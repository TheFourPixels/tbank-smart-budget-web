import React, { useState, useEffect } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import { useNavigate } from 'react-router-dom';
import styles from './BudgetSettings.module.css';
import { budgetService } from '../../../services/BudgetService.js';
import { categoryService } from '../../../services/CategoryService.js';

const BudgetSettings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState({});
  const navigate = useNavigate();

  const categoryIcons = {
    1: "🛒", 
    2: "🍎",
    3: "🚗", 
    4: "🏠", 
    5: "💡",
    6: "📱", 
    7: "👕", 
    8: "💊",
    9: "🎬",
    10: "🎓", 
    11: "✈️", 
    12: "🎁",
    13: "🐶", 
    14: "🏋️",
    15: "💳", 
  };

  const loadAllCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      console.log('Все категории:', response);
      
      const categoriesMap = {};
      if (response.content && Array.isArray(response.content)) {
        response.content.forEach(cat => {
          categoriesMap[cat.id] = cat.name;
        });
      }
      
      setAllCategories(categoriesMap);
      return categoriesMap;
    } catch (error) {
      console.error('Ошибка загрузки списка категорий:', error);
      return {};
    }
  };

  useEffect(() => {
    const loadCategoryStats = async () => {
      try {
        setLoading(true);
        
        const categoriesMap = await loadAllCategories();
        
        const savedYear = localStorage.getItem('budgetYear');
        const savedMonth = localStorage.getItem('budgetMonth');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        const year = savedYear ? parseInt(savedYear) : currentYear;
        const month = savedMonth ? parseInt(savedMonth) : currentMonth;
        
        // Загружаем статистику по категориям
        const categoryStats = await budgetService.getCategoryStats(year, month);
        console.log('Статистика категорий:', categoryStats);
        
        // Обрабатываем категории с лимитами
        const categoriesWithLimits = categoryStats
          .filter(cat => cat && cat.limit > 0)
          .map(cat => {
            const categoryName = allCategories[cat.id] || categoriesMap[cat.id] || `Категория ${cat.id}`;
            
            return {
              id: cat.id,
              title: categoryName,
              spent: cat.spent ? `${Math.round(cat.spent).toLocaleString('ru-RU')} ₽` : "0 ₽",
              limit: cat.limit ? `${Math.round(cat.limit).toLocaleString('ru-RU')} ₽` : "0 ₽",
              available: cat.available ? `${Math.round(cat.available).toLocaleString('ru-RU')} ₽` : "0 ₽",
              icon: categoryIcons[cat.id] || "📁",
              progress: cat.progress || 0,
              rawSpent: cat.spent || 0,
              rawLimit: cat.limit || 0,
              rawAvailable: cat.available || 0
            };
          })
          .sort((a, b) => b.progress - a.progress) 
          .slice(0, 2);
        
        console.log('Обработанные категории:', categoriesWithLimits);
        setCategories(categoriesWithLimits);
        
      } catch (error) {
        console.error('Ошибка загрузки статистики категорий:', error);
        
        const defaultCategories = [
          {
            id: 1,
            title: "Маркетплейсы",
            spent: "12 300 ₽",
            limit: "15 400 ₽",
            available: "2 567 ₽",
            icon: "🛒",
            progress: 70,
            rawSpent: 12300,
            rawLimit: 15400,
            rawAvailable: 2567
          },
          {
            id: 2,
            title: "Продукты",
            spent: "8 500 ₽",
            limit: "10 000 ₽",
            available: "1 500 ₽",
            icon: "🍎",
            progress: 85,
            rawSpent: 8500,
            rawLimit: 10000,
            rawAvailable: 1500
          },
          {
            id: 3,
            title: "Транспорт",
            spent: "4 200 ₽",
            limit: "6 000 ₽",
            available: "1 800 ₽",
            icon: "🚗",
            progress: 50,
            rawSpent: 4200,
            rawLimit: 6000,
            rawAvailable: 1800
          },
          {
            id: 4,
            title: "Развлечения",
            spent: "3 700 ₽",
            limit: "5 000 ₽",
            available: "1 300 ₽",
            icon: "🎬",
            progress: 65,
            rawSpent: 3700,
            rawLimit: 5000,
            rawAvailable: 1300
          }
        ];
        
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryStats();
  }, []);

  const handleClick = () => { 
    navigate('/budget/categories');
  };

  const calculateOverallProgress = () => {
    if (categories.length === 0) return 0;
    
    const totalSpent = categories.reduce((sum, cat) => sum + (cat.rawSpent || 0), 0);
    const totalLimit = categories.reduce((sum, cat) => sum + (cat.rawLimit || 0), 0);
    
    return totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
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

  const overallProgress = calculateOverallProgress();

  return (
    <section className={styles.settingsSection}>
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          
        </div>
        <button onClick={handleClick} className={styles.viewAllButton}>
          {categories.length === 0 ? 'Настроить категории' : 'Все категории'}
        </button>
      </div>
      
      {categories.length === 0 ? (
        <div className={styles.emptyState}>
          
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
        <>
          <div className={styles.categoriesGrid}>
            {categories.map(category => (
              <CategoryCard 
                key={category.id} 
                category={category}
                onClick={() => navigate(`/budget/categories/${category.id}`)}
              />
            ))}
          </div>
          
          {/* Сводная информация */}
          
        </>
      )}
    </section>
  );
};

export default BudgetSettings;