import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Budget/Header/Header';
import styles from './CategoriesPage.css';
import { categoryService } from '../../services/CategoryService';
import { budgetService } from '../../services/BudgetService';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [error, setError] = useState(null);
  const [budgetError, setBudgetError] = useState(null);
  
  // Состояние для бюджета
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetLimits, setBudgetLimits] = useState([]);
  const [addingToBudget, setAddingToBudget] = useState({}); // Отслеживаем процесс добавления
  
  // Текущая дата для получения актуального бюджета
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // Месяцы от 1 до 12

  // Загрузка категорий при монтировании компонента
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
      // Используем content из ответа пагинации
      const categoriesData = response.content || [];
      
      // Преобразуем данные API в формат, ожидаемый компонентом
      const formattedCategories = categoriesData.map(category => ({
        id: category.id,
        name: category.name,
        twoLines: category.name && category.name.length > 15,
        isInBudget: false, // Изначально устанавливаем false, потом обновим
        limit: 0, // Лимит по умолчанию
        limit_type: 'ABSOLUTE' // Тип лимита: ABSOLUTE или PERCENT
      }));
      
      setCategories(formattedCategories);
      console.log(formattedCategories)
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      setError('Не удалось загрузить категории. Пожалуйста, попробуйте позже.');
      
      // Используем тестовые данные при ошибке
      const defaultCategories = getDefaultCategories();
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка текущего бюджета
  const loadCurrentBudget = async () => {
    setBudgetLoading(true);
    setBudgetError(null);
    
    try {
      // Получаем бюджет на текущий период
      const response = await budgetService.getBudget(currentYear, currentMonth);
      
      if (response && response.limits) {
        setCurrentBudget(response);
        setBudgetLimits(response.limits || []);
        updateCategoriesWithBudgetInfo(response.limits);
        console.log(response)
      } else {
        // Бюджет не найден, создаем пустой
        setCurrentBudget(null);
        setBudgetLimits([]);
      }
    } catch (err) {
      console.error('Ошибка загрузки бюджета:', err);
      setBudgetError('Не удалось загрузить информацию о бюджете');
      
      // Если бюджет не найден (404), это нормально - значит бюджет еще не создан
      if (err.response && err.response.status === 404) {
        console.log('Бюджет на текущий период не найден');
        setCurrentBudget(null);
        setBudgetLimits([]);
      }
    } finally {
      setBudgetLoading(false);
    }
  };

  // Обновляем информацию о категориях на основе данных бюджета
  const updateCategoriesWithBudgetInfo = (limits) => {
    console.log(limits)
    setCategories(prevCategories => {
      return prevCategories.map(category => {
        const limitInfo = limits.find(limit => limit.category_id === category.id);
        if (limitInfo) {
          return {
            ...category,
            isInBudget: true,
            limit: limitInfo.limit_value || 0,
            limit_type: limitInfo.limit_type || 'ABSOLUTE'
          };
        }
        
        return category;
      });
    });
  };

  // Функция получения дефолтных категорий
  const getDefaultCategories = () => {
    return [
      { id: 1, name: "Транспорт", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 2, name: "Музыкальные инструменты", twoLines: true, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 3, name: "Продукты", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 4, name: "Рестораны", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 5, name: "Развлечения", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 6, name: "Одежда", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 7, name: "Здоровье", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 8, name: "Образование", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 9, name: "Путешествия", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 10, name: "Коммунальные услуги", twoLines: true, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 11, name: "Техника", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
      { id: 12, name: "Подарки", twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
    ];
  };

  const handleNavigateToMain = () => {
    navigate('/');
  };

  const handleNavigateToCreateCategory = () => {
    navigate('/categories/create');
  };

  // Обработчик клика по категории - добавляет категорию в бюджет
  const handleCategoryClick = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    
    // Если категория уже в бюджете, ничего не делаем
    if (category && category.isInBudget) {
      console.log('Категория уже добавлена в бюджет');
      return;
    }

    // Устанавливаем состояние добавления для этой категории
    setAddingToBudget(prev => ({ ...prev, [categoryId]: true }));

    try {
      // Подготавливаем данные для обновления бюджета
      console.log(categoryId)
      const newLimit = {
        categoryId: categoryId,
        limit_value: 0, // Начальный лимит 0, пользователь сможет изменить позже
        limit_type: "PERCENT" // Можно сделать настройку типа лимита
      };

      // Получаем текущие лимиты из бюджета или создаем пустой массив
      const currentLimits = budgetLimits || [];
      
      // Добавляем новый лимит к существующим
      const updatedLimits = [...currentLimits, newLimit];
      console.log(updatedLimits)

      // Данные для обновления бюджета
      const budgetData = {
        year: currentYear,
        month: currentMonth,
        totalIncome: currentBudget ? currentBudget.totalIncome : 0, // Если бюджета нет, устанавливаем 0
        limits: updatedLimits
      };

      // Отправляем запрос на создание/обновление бюджета
      const response = await budgetService.createOrUpdateBudget(budgetData);
      
      // Обновляем состояние бюджета
      setCurrentBudget(response);
      setBudgetLimits(response.limits || []);
      
      // Обновляем информацию о категории
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId 
            ? { 
                ...cat, 
                isInBudget: true, 
                limit: 0,
                limit_type: 'PERCENT'
              } 
            : cat
        )
      );

      console.log(`Категория ${categoryId} успешно добавлена в бюджет`);
      
    } catch (err) {
      console.error('Ошибка добавления категории в бюджет:', err);
      
      // Показываем сообщение об ошибке
      setError('Не удалось добавить категорию в бюджет. Пожалуйста, попробуйте позже.');
      
      // Через 3 секунды убираем сообщение об ошибке
      setTimeout(() => setError(null), 3000);
    } finally {
      // Сбрасываем состояние добавления
      setAddingToBudget(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  // Функция для форматирования отображения лимита
  const formatLimit = (limit, limit_type) => {
    if (limit_type === 'PERCENT') {
      return `${limit}%`;
    }
    return `${limit.toLocaleString('ru-RU')} ₽`;
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, categories]);

  return (
    <div className="categories-page">
      <Header />
      <main className="categories-main">
        <div className="categories-main__header">
          <button onClick={handleBack} className="backButton">
            <svg className="backButtonIcon" width="9" height="12" viewBox="0 0 9 12" fill="none">
              <path d="M1.67066 4.22857L3.66467 2.66094L7.38323 0L9 0.203795L1.67066 6.08951L9 11.6324L7.38323 12L2.85629 9.00379L0 6.08951L1.67066 4.22857Z" fill="black" fillOpacity="0.5"/>
            </svg>
            <span className="backButtonText">Назад</span>
          </button>
        </div>
        
        <h1 className="categories-main__title">Категории вашего бюджета</h1>

        {/* Информация о текущем бюджете */}
        <div className="budget-info">
          <div className="budget-period">
            Бюджет на {currentMonth}.{currentYear}
            {currentBudget && (
              <span className="budget-income">
                • Доход: {currentBudget.totalIncome.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
          <button 
            className="refresh-budget-btn"
            onClick={loadCurrentBudget}
            disabled={budgetLoading}
          >
            {budgetLoading ? 'Обновление...' : 'Обновить бюджет'}
          </button>
        </div>

        <div className="categories-main__content">
          <div className="search-section">
            <div className="search-bar">
              <svg className="search-bar__icon" width="18" height="19" viewBox="0 0 18 19" fill="none">
                <path d="M11.5 12L16.75 17.5M7.125 13.8333C3.74226 13.8333 1 10.9605 1 7.41667C1 3.87284 3.74226 1 7.125 1C10.5077 1 13.25 3.87284 13.25 7.41667C13.25 10.9605 10.5077 13.8333 7.125 13.8333Z" stroke="#969CA4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                className="search-bar__input" 
                placeholder="Название категории"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="search-results">
              Найдено: {filteredCategories.length} категорий
              {budgetLimits.length > 0 && ` • В бюджете: ${budgetLimits.length}`}
            </div>
          </div>
          
          {/* Сообщения об ошибках */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}
          
          {budgetError && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {budgetError}
            </div>
          )}
          
          {/* Состояние загрузки */}
          {(loading || budgetLoading) && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Загрузка...</p>
            </div>
          )}
          
          {/* Сетка категорий */}
          {!loading && !budgetLoading && (
            <>
              <div className="categories-grid">
                {filteredCategories.length === 0 ? (
                  <div className="no-categories">
                    <p>Категории не найдены</p>
                    {searchQuery && (
                      <button 
                        className="clear-search-btn"
                        onClick={() => setSearchQuery('')}
                      >
                        Очистить поиск
                      </button>
                    )}
                  </div>
                ) : (
                  filteredCategories.map((category) => (
                    <div 
                      key={category.id} 
                      className={`category-item ${
                        category.isInBudget ? 'category-item--in-budget' : 'category-item--available'
                      } ${addingToBudget[category.id] ? 'category-item--adding' : ''}`}
                      onClick={() => !category.isInBudget && handleCategoryClick(category.id)}
                      style={{ cursor: category.isInBudget ? 'default' : 'pointer' }}
                    >
                      <div className="category-item__content">
                        <span className={`category-item__name ${category.twoLines ? 'category-item__name--two-lines' : ''}`}>
                          {category.name}
                        </span>
                        
                        {/* Индикатор добавления в бюджет */}
                        {category.isInBudget ? (
                          <div className="category-budget-info">
                            <span className="budget-badge">
                              <span className="budget-icon">✓</span>
                              В бюджете
                            </span>
                            <div className="category-limit">
                              Лимит: {formatLimit(category.limit, category.limit_type)}
                            </div>
                          </div>
                        ) : (
                          <div className="category-add-info">
                            {addingToBudget[category.id] ? (
                              <span className="adding-text">Добавляется...</span>
                            ) : (
                              <>
                                <span className="add-badge">
                                  <span className="add-icon">+</span>
                                  Добавить в бюджет
                                </span>
                                
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {addingToBudget[category.id] && (
                        <div className="category-loading">
                          <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              {/*<div className="create-category-container">
                <button 
                  onClick={handleNavigateToCreateCategory} 
                  className="create-category-btn"
                  disabled={loading}
                >
                  <span className="create-category-btn__plus">+</span>
                  Создать свою категорию
                </button>
                
                <div className="budget-summary">
                  <div className="summary-item">
                    <span className="summary-label">Всего категорий в бюджете:</span>
                    <span className="summary-value">{budgetLimits.length}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Доступно для добавления:</span>
                    <span className="summary-value">
                      {categories.filter(c => !c.isInBudget).length}
                    </span>
                  </div>
                </div>
              </div>*/}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CategoriesPage;