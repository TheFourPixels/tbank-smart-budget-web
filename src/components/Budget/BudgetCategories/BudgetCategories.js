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
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editLimitValue, setEditLimitValue] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

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
      
      const [budget, summaryData, categoriesData, statsData] = await Promise.all([
        budgetService.getBudget(currentYear, currentMonth),
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

      const budgetCategoriesId = budget.limits.map((e) => e.category_id)
      formattedCategories = formattedCategories.filter((e) => budgetCategoriesId.includes(e.id))
      
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

  const calculateBudgetDistribution = () => {
    const totalLimit = categories.reduce((sum, category) => {
      const limitValue = parseInt(category.limit.replace(/\D/g, '')) || 0;
      return sum + limitValue;
    }, 0);

    return categories.map(category => {
      const limitValue = parseInt(category.limit.replace(/\D/g, '')) || 0;
      const spentValue = parseInt(category.spent.replace(/\D/g, '')) || 0;
      const percentage = totalLimit > 0 ? Math.round((limitValue / totalLimit) * 100) : 0;
      
      return {
        ...category,
        distributionPercentage: percentage,
        distributionAmount: limitValue,
        spentAmount: spentValue,
        limitNumber: limitValue
      };
    }).sort((a, b) => b.distributionAmount - a.distributionAmount);
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

  const handleEditLimit = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      setEditingCategoryId(categoryId);
      setEditLimitValue(category.limit.replace(/\D/g, ''));
      setIsEditModalOpen(true);
    }
  };

  const handleSaveLimit = async () => {
    if (!editingCategoryId || !editLimitValue) return;

    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;

      const budget = await budgetService.getBudget(currentYear, currentMonth);
      
      if (!budget) {
        throw new Error('Бюджет не найден');
      }

      const newLimitValue = parseInt(editLimitValue);
      if (isNaN(newLimitValue) || newLimitValue < 0) {
        throw new Error('Введите корректную сумму');
      }

      const budgetData = {
        year: currentYear,
        month: currentMonth,
        totalIncome: budget.totalIncome || 0,
        limits: budget.limits.map(limit => 
          limit.category_id === editingCategoryId 
            ? { ...limit, limit_value: newLimitValue }
            : limit
        )
      };

      await budgetService.createOrUpdateBudget(budgetData);

      setCategories(prev => prev.map(cat => 
        cat.id === editingCategoryId 
          ? { 
              ...cat, 
              limit: `${formatCurrency(newLimitValue)} Р`,
              available: `${formatCurrency(newLimitValue - (parseInt(cat.spent.replace(/\D/g, '')) || 0))} Р`
            } 
          : cat
      ));

      setSuccessMessage('Лимит успешно обновлен');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsEditModalOpen(false);
      setEditingCategoryId(null);
      setEditLimitValue('');
      
    } catch (err) {
      console.error('Ошибка обновления лимита:', err);
      setError('Не удалось обновить лимит');
    }
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

  const budgetDistribution = calculateBudgetDistribution();

  if (loading) {
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

          <section className={styles.budgetDistribution}>
            <div className={styles.distributionHeader}>
              <h3 className={styles.sectionTitle}>Распределение бюджета</h3>
              <div className={styles.distributionTotal}>
                Всего: {formatCurrency(budgetDistribution.reduce((sum, cat) => sum + cat.distributionAmount, 0))} ₽
              </div>
            </div>
            
            <div className={styles.distributionList}>
              {budgetDistribution.map((category) => (
                <div key={category.id} className={styles.distributionItem}>
                  <div className={styles.distributionInfo}>
                    <div className={styles.distributionIcon}>{category.icon}</div>
                    <div className={styles.distributionText}>
                      <div className={styles.distributionName}>{category.title}</div>
                      <div className={styles.distributionValue}>{formatCurrency(category.distributionAmount)} ₽</div>
                    </div>
                    <button 
                      className={styles.editLimitBtn}
                      onClick={() => handleEditLimit(category.id)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M11.3333 1.99992C11.5083 1.82492 11.7163 1.68742 11.9441 1.59459C12.1719 1.50175 12.415 1.45542 12.6604 1.45825C12.9058 1.46108 13.148 1.513 13.3729 1.61084C13.5977 1.70867 13.8005 1.85042 13.9691 2.02742C14.1377 2.20442 14.2687 2.41325 14.3543 2.64142C14.4399 2.86959 14.4783 3.11242 14.4674 3.35542C14.4564 3.59842 14.3963 3.83642 14.2908 4.05542C14.1853 4.27442 14.0367 4.46959 13.8541 4.62825L5.24992 13.2324L1.33325 14.6666L2.76742 10.7499L11.3333 1.99992Z" stroke="#007AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className={styles.distributionBar}>
                    <div 
                      className={styles.distributionFill}
                      style={{ width: `${category.distributionPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
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

      {isEditModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Редактировать лимит</h3>
              <button 
                className={styles.modalClose}
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategoryId(null);
                  setEditLimitValue('');
                }}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.editCategoryInfo}>
                <div className={styles.editCategoryIcon}>
                  {categories.find(c => c.id === editingCategoryId)?.icon}
                </div>
                <div className={styles.editCategoryName}>
                  {categories.find(c => c.id === editingCategoryId)?.title}
                </div>
              </div>
              
              <div className={styles.editLimitInput}>
                <label className={styles.editLimitLabel}>Лимит расходов (₽)</label>
                <input
                  type="number"
                  className={styles.limitInput}
                  value={editLimitValue}
                  onChange={(e) => setEditLimitValue(e.target.value)}
                  placeholder="Введите сумму"
                  min="0"
                />
                <div className={styles.inputHint}>
                  Текущий лимит: {categories.find(c => c.id === editingCategoryId)?.limit}
                </div>
              </div>
            </div>
            
            <div className={styles.modalActions}>
              <button 
                className={styles.modalCancel}
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCategoryId(null);
                  setEditLimitValue('');
                }}
              >
                Отмена
              </button>
              <button 
                className={styles.modalSave}
                onClick={handleSaveLimit}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCategories;