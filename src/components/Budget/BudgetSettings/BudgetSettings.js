import React, { useState, useEffect } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import { useNavigate } from 'react-router-dom';
import styles from './BudgetSettings.module.css';
import { budgetService } from '../../../services/BudgetService.js';
import { categoryService } from '../../../services/CategoryService.js';

const BudgetSettings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategoryStats = async () => {
      try {
        setLoading(true);

        const [categoriesData, categoryStats] = await Promise.all([
          categoryService.getCategories({ size: 100 }),
          loadCategoryStatsData()
        ]);

        const categoriesMap = {};
        if (categoriesData.content && Array.isArray(categoriesData.content)) {
          categoriesData.content.forEach(cat => {
            categoriesMap[cat.id] = cat.name;
          });
        }

        const categoriesWithLimits = categoryStats
          .filter(cat => cat && cat.limit > 0)
          .map(cat => {
            const title = categoriesMap[cat.id] || `Категория ${cat.id}`;

            const rawSpent = cat.spent || 0;
            const rawLimit = cat.limit || 0;
            const rawAvailable = cat.available || 0;

            return {
              id: cat.id,
              title,
              spent: `${Math.round(rawSpent).toLocaleString('ru-RU')} Р`,
              limit: `${Math.round(rawLimit).toLocaleString('ru-RU')} Р`,
              available: `${Math.round(rawAvailable).toLocaleString('ru-RU')} Р`,
              rawSpent,
              rawLimit,
              rawAvailable,
              progress: cat.progress || 0,
            };
          })
          .sort((a, b) => b.progress - a.progress)
          .slice(0, 2);

        setCategories(categoriesWithLimits);
      } catch (error) {
        console.error('Ошибка загрузки статистики категорий:', error);

        const defaultCategories = [
          {
            id: 1,
            title: 'Маркетплейсы',
            spent: '12 300 Р',
            limit: '15 400 Р',
            available: '2 567 Р',
            rawSpent: 12300,
            rawLimit: 15400,
            rawAvailable: 2567,
            progress: 70,
          },
          {
            id: 2,
            title: 'Продукты',
            spent: '8 500 Р',
            limit: '10 000 Р',
            available: '1 500 Р',
            rawSpent: 8500,
            rawLimit: 10000,
            rawAvailable: 1500,
            progress: 85,
          },
        ];
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryStats();
  }, []);

  const loadCategoryStatsData = async () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    return await budgetService.getCategoryStats(currentYear, currentMonth);
  };

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
          <div className={styles.emptyStateText}>
            <h4 className={styles.emptyStateTitle}>Категории не настроены</h4>
            <p className={styles.emptyStateDescription}>
              Добавьте категории расходов, чтобы отслеживать бюджет по отдельным статьям
            </p>
          </div>
          <button onClick={handleClick} className={styles.addCategoriesButton}>
            Добавить категории
          </button>
        </div>
      ) : (
        <div className={styles.categoriesGrid}>
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => navigate(`/budget/categories/${category.id}`)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BudgetSettings;
