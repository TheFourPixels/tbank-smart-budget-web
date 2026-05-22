import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Budget/Header/Header';
import { categoryService } from '../../services/CategoryService';
import { budgetService } from '../../services/BudgetService';
import './CategoriesPage.css';
import CategoriesGrid from './CategoriesGrid';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [error, setError] = useState(null);
  const [budgetError, setBudgetError] = useState(null);
  
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetLimits, setBudgetLimits] = useState([]);
  const [addingToBudget, setAddingToBudget] = useState({});
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    loadCurrentBudget();
    loadCategories();
        loadCurrentBudget();

  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryService.getCategories();
      const categoriesData = response.content || [];
      
      const formattedCategories = categoriesData.map(category => ({
        id: category.id,
        name: category.name,
        twoLines: category.name && category.name.length > 15,
        isInBudget: false,
        limit: 0,
        limit_type: 'SUM'
      }));
      
      setCategories(formattedCategories);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      setError('Не удалось загрузить категории. Пожалуйста, попробуйте позже.');
      const defaultCategories = getDefaultCategories();
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentBudget = async () => {
    setBudgetLoading(true);
    setBudgetError(null);
    
    try {
      const response = await budgetService.getBudget(currentYear, currentMonth);
      
      if (response && response.limits) {
        setCurrentBudget(response);
        setBudgetLimits(response.limits || []);
        updateCategoriesWithBudgetInfo(response.limits);
      } else {
        setCurrentBudget(null);
        setBudgetLimits([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки бюджета:', err);
      setBudgetError('Не удалось загрузить информацию о бюджете');
      
      if (err.response && err.response.status === 404) {
        console.log('Бюджет на текущий период не найден');
        setCurrentBudget(null);
        setBudgetLimits([]);
      }
    } finally {
      setBudgetLoading(false);
    }
  };

  const updateCategoriesWithBudgetInfo = (limits) => {
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        const limitInfo = limits.find(limit => limit.category_id === category.id);
        if (limitInfo) {
          return {
            ...category,
            isInBudget: true,
            limit: limitInfo.limit_value || 0,
            limit_type: limitInfo.limit_type || 'SUM'
          };
        }
        return category;
      });
    });
  };

  const getDefaultCategories = () => {
    return [
      { id: 1, name: "Транспорт", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 2, name: "Музыкальные инструменты", twoLines: true, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 3, name: "Продукты", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 4, name: "Рестораны", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 5, name: "Развлечения", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 6, name: "Одежда", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 7, name: "Здоровье", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 8, name: "Образование", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 9, name: "Путешествия", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 10, name: "Коммунальные услуги", twoLines: true, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 11, name: "Техника", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
      { id: 12, name: "Подарки", twoLines: false, isInBudget: false, limit: 0, limit_type: 'SUM' },
    ];
  };

  const handleNavigateToCreateCategory = () => {
    navigate('/categories/create');
  };

  const handleCategoryClick = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    
    if (category && category.isInBudget) {
      console.log('Категория уже добавлена в бюджет');
      return;
    }

    setAddingToBudget(prev => ({ ...prev, [categoryId]: true }));

    try {
      const newLimit = {
        categoryId: categoryId,
        limit_value: 0,
        limit_type: "SUM"
      };

      const currentLimits = budgetLimits || [];
      const updatedLimits = [...currentLimits, newLimit];

      const budgetData = {
        year: currentYear,
        month: currentMonth,
        totalIncome: currentBudget ? currentBudget.totalIncome : 0,
        limits: updatedLimits
      };

      const response = await budgetService.createOrUpdateBudget(budgetData);
      
      setCurrentBudget(response);
      setBudgetLimits(response.limits || []);
      
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId 
            ? { 
                ...cat, 
                isInBudget: true, 
                limit: 0,
                limit_type: 'SUM'
              } 
            : cat
        )
      );
    } catch (err) {
      console.error('Ошибка добавления категории в бюджет:', err);
      setError('Не удалось добавить категорию в бюджет. Пожалуйста, попробуйте позже.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setAddingToBudget(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleLimitChange = async (categoryId, newValue) => {
    const rawValue = newValue.replace(/[^\d]/g, '');
    const limitValue = parseInt(rawValue, 10) || 0;

    const updatedLimits = budgetLimits.map(limit => 
      limit.category_id === categoryId 
        ? { ...limit, limit_value: limitValue }
        : limit
    );

    try {
      const budgetData = {
        year: currentYear,
        month: currentMonth,
        totalIncome: currentBudget ? currentBudget.totalIncome : 0,
        limits: updatedLimits
      };

      const response = await budgetService.createOrUpdateBudget(budgetData);
      
      setCurrentBudget(response);
      setBudgetLimits(response.limits || []);
      
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId 
            ? { ...cat, limit: limitValue }
            : cat
        )
      );
    } catch (err) {
      console.error('Ошибка обновления лимита:', err);
      setError('Не удалось обновить лимит');
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatLimit = (limit, limit_type) => {
    if (limit_type === 'PERCENT') {
      return `${limit}%`;
    }
    return `${limit.toLocaleString('ru-RU')} ₽`;
  };

  const parseLimitFromString = (str) => {
    const num = str.replace(/[^\d]/g, '');
    return parseInt(num, 10) || 0;
  };

  const budgetCategories = useMemo(() => {
    return categories.filter(c => c.isInBudget);
  }, [categories]);

  const availableCategories = useMemo(() => {
    return categories.filter(c => 
      !c.isInBudget && 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, categories]);

  const getCategoryLimit = (categoryId) => {
    const limit = budgetLimits.find(l => l.category_id === categoryId);
    return limit ? limit.limit_value : 0;
  };

  const getCategoryLimitType = (categoryId) => {
    const limit = budgetLimits.find(l => l.category_id === categoryId);
    return limit ? limit.limit_type : 'SUM';
  };

  const getSpentAmount = (categoryId) => {
    return 0;
  };

  return (
    <div className="page">
      <Header />
      
      <main className="main">
        <div className="container main__container">
          <h2 className="main__title">Категории вашего бюджета</h2>
          <section className="categories-section">
            <div className="categories-card">
              <div className="categories-card__content">
                <span className="categories-card__label">Выбранные категории</span>
                <div className="categories-icons">
                  {budgetCategories.length === 0 ? (
                    <span className="categories-empty">Нет выбранных категорий</span>
                  ) : (
                    budgetCategories.map(cat => (
                      <div key={cat.id} className="icon" title={cat.name}>
                        <div className="icon__placeholder">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button 
                  className="button button--primary categories-card__button"
                  onClick={handleNavigateToCreateCategory}
                >
                  <span>Добавить категорию</span>
                </button>
              </div>
            </div>
          </section >
          <section className="available-section">
            <h2 className="stat-title">Статистика по категориям</h2>
            
            <div className="search">
              <div className="search__content">
                <svg className="search__icon" width="18" height="19" viewBox="0 0 18 19" fill="none">
                  <path d="M11.5 12L16.75 17.5M7.125 13.8333C3.74226 13.8333 1 10.9605 1 7.41667C1 3.87284 3.74226 1 7.125 1C10.5077 1 13.25 3.87284 13.25 7.41667C13.25 10.9605 10.5077 13.8333 7.125 13.8333Z" stroke="#969CA4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                  type="text" 
                  className="search__input" 
                  placeholder="Название категории"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className="search__clear"
                    onClick={() => setSearchQuery('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            
            </div>

          <CategoriesGrid 
  categories={categories} 
  searchQuery={searchQuery}
/>

          </section>
        </div>
      </main>
    </div>
  );
};

export default CategoriesPage;
