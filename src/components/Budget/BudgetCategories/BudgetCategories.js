import React, { useState, useEffect } from 'react';
import CategoryCard from '../CategoryCard/CategoryCard';
import styles from './BudgetCategories.module.css';
import Header from '../Header/Header';
import { useNavigate } from 'react-router-dom';
import { budgetService } from '../../../services/BudgetService';
import { categoryService } from '../../../services/CategoryService';

const BudgetCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [budgetSummary, setBudgetSummary] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      

      const [summaryData, categoriesData, statsData] = await Promise.all([
        budgetService.getBudgetSummary(currentYear, currentMonth),
        categoryService.getCategories(),
        budgetService.getCategoryStats(currentYear, currentMonth)
      ]);
      
      setBudgetSummary(summaryData);
      

      const categoriesList = categoriesData.content || [];
      let formattedCategories = categoriesList.map(category => ({
        id: category.id,
        icon: getCategoryIcon(category.name),
        title: category.name,
        ...getCategoryStatsData(category.id, statsData)
      }));

      formattedCategories = formattedCategories.filter((e) => e.limit != "0 Р")
      
      setCategories(formattedCategories);
      

      setSelectedCategories(formattedCategories.slice(0, 2).map(cat => ({
        id: cat.id,
        icon: cat.icon,
        title: cat.title
      })));
      
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      

      setDefaultData();
    } finally {
      setLoading(false);
    }
  };


  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Транспорт': '🚗',
      'Продукты': '🍎',
      'Рестораны': '🍽️',
      'Развлечения': '🎭',
      'Одежда': '👕',
      'Здоровье': '🏥',
      'Образование': '📚',
      'Путешествия': '✈️',
      'Коммунальные услуги': '🏠',
      'Техника': '💻',
      'Подарки': '🎁',
      'Маркетплейсы': '🛒',
      'Музыкальные инструменты': '🎸',
    };
    

    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName && categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '📁';
  };


  const getCategoryStatsData = (categoryId, statsData) => {
    const stat = statsData.find(s => s.id === categoryId);
    if (stat) {
      return {
        progress: stat.progress || 0,
        spent: `${formatCurrency(stat.spent || 0)} Р`,
        limit: `${formatCurrency(stat.limit || 0)} Р`,
        available: `${formatCurrency(stat.available || 0)} Р`
      };
    }
    

    return {
      progress: 0,
      spent: '0 Р',
      limit: '0 Р',
      available: '0 Р'
    };
  };


  const formatCurrency = (amount) => {
    return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };


  const setDefaultData = () => {
    setBudgetSummary({
      title: 'Бюджет на текущий месяц',
      balance: 0,
      period: 'Текущий месяц',
      income: 0,
      expenseLimit: 0,
      freeMoney: 0
    });
    
    const defaultCategories = [
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
    ];
    
    setCategories(defaultCategories);
    setSelectedCategories(defaultCategories.slice(0, 2).map(cat => ({
      id: cat.id,
      icon: cat.icon,
      title: cat.title
    })));
  };

  const handleEditCategory = (categoryId) => {

    console.log('Редактировать категорию:', categoryId);

  };

  const handleClick = () => { 
    navigate('/categories');
  };

  const handleBack = () => {
    navigate(-1);
  };


  const totalSpent = categories.reduce((sum, category) => {
    const spentValue = parseInt(category.spent.replace(/\D/g, '')) || 0;
    return sum + spentValue;
  }, 0);

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <button onClick={handleBack} className={styles.backButton}>
            <svg className="back-button__icon" width="9" height="12" viewBox="0 0 9 12" fill="none">
              <path d="M1.67066 4.22857L3.66467 2.66094L7.38323 0L9 0.203795L1.67066 6.08951L9 11.6324L7.38323 12L2.85629 9.00379L0 6.08951L1.67066 4.22857Z" fill="black" fillOpacity="0.5"/>
            </svg>
            <span className="back-button__text">Назад</span>
          </button>
          </div>
          <h1 className={styles.title}>Категории</h1>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка данных...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <button onClick={handleBack} className={styles.backButton}>
              <svg className={styles.backButtonIcon} width="9" height="12" viewBox="0 0 9 12" fill="none">
                <path d="M1.67066 4.22857L3.66467 2.66094L7.38323 0L9 0.203795L1.67066 6.08951L9 11.6324L7.38323 12L2.85629 9.00379L0 6.08951L1.67066 4.22857Z" fill="black" fillOpacity="0.5"/>
              </svg>
              <span className={styles.backButtonText}>Назад</span>
            </button>
          </div>
          <h1 className={styles.title}>Категории</h1>
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={loadData} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header/>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <button onClick={handleBack} className={styles.backButton}>
            <svg className={styles.backButtonIcon} width="9" height="12" viewBox="0 0 9 12" fill="none">
              <path d="M1.67066 4.22857L3.66467 2.66094L7.38323 0L9 0.203795L1.67066 6.08951L9 11.6324L7.38323 12L2.85629 9.00379L0 6.08951L1.67066 4.22857Z" fill="black" fillOpacity="0.5"/>
            </svg>
            <span className={styles.backButtonText}>Назад</span>
          </button>
        </div>
        
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
            <button onClick={handleClick} className={styles.addCategoryBtn}>
              Добавить категорию
            </button>
          </section>

          <section className={styles.statisticsSection}>
            <h2 className={styles.sectionTitle}>Статистика по категориям</h2>
            <div className={styles.statisticsGrid}>
              {categories.length > 0 ? (
                categories.map(category => (
                  <CategoryCard 
                    key={category.id} 
                    category={category}
                    onEdit={() => handleEditCategory(category.id)}
                  />
                ))
              ) : (
                <div className={styles.noCategories}>
                  <p>У вас пока нет категорий с лимитами</p>
                  <button onClick={handleClick} className={styles.createCategoryBtn}>
                    Создать категорию
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default BudgetCategories;