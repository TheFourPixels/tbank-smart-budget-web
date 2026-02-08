import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetService } from '../../../services/BudgetService.js';
import { categoryService } from '../../../services/CategoryService.js';
import Header from '../Header/Header.js';
import './CreateBudgetForm.css';

const CreateBudgetForm = () => {
  const navigate = useNavigate();
  const [budgetName, setBudgetName] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  
  // Состояния для категорий
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryLimits, setCategoryLimits] = useState({});
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchCategory, setSearchCategory] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await categoryService.getCategories();
      const categoriesList = response.content || response;
      setCategories(Array.isArray(categoriesList) ? categoriesList : []);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      setServerError('Не удалось загрузить категории');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const filteredCategories = searchCategory
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(searchCategory.toLowerCase())
      )
    : categories;

  const validateForm = () => {
    setServerError('');
    setError('');
    
    if (!budgetName.trim()) {
      setError('Введите название бюджета');
      return false;
    }
    
    const totalIncome = parseFloat(budgetLimit);
    if (isNaN(totalIncome) || totalIncome <= 0) {
      setError('Общий доход должен быть положительным числом');
      return false;
    }
    
    if (totalIncome > 1000000000) {
      setError('Сумма слишком большая');
      return false;
    }

    // Проверяем сумму лимитов по категориям
    const totalLimits = Object.values(categoryLimits).reduce((sum, limit) => sum + (parseFloat(limit) || 0), 0);
    if (totalLimits > totalIncome) {
      setError(`Сумма лимитов по категориям (${totalLimits.toLocaleString('ru-RU')} ₽) превышает общий доход`);
      return false;
    }

    return true;
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        // Удаляем категорию и ее лимит
        const newCategoryLimits = { ...categoryLimits };
        delete newCategoryLimits[categoryId];
        setCategoryLimits(newCategoryLimits);
        return prev.filter(id => id !== categoryId);
      } else {
        // Добавляем категорию с нулевым лимитом
        setCategoryLimits(prev => ({
          ...prev,
          [categoryId]: ''
        }));
        return [...prev, categoryId];
      }
    });
  };

  const handleLimitChange = (categoryId, value) => {
    setCategoryLimits(prev => ({
      ...prev,
      [categoryId]: value
    }));
  };

  const calculateRemainingAmount = () => {
    const totalIncome = parseFloat(budgetLimit) || 0;
    const totalLimits = Object.values(categoryLimits).reduce(
      (sum, limit) => sum + (parseFloat(limit) || 0), 0
    );
    return totalIncome - totalLimits;
  };

  const handleAutoDistribute = () => {
    const totalIncome = parseFloat(budgetLimit) || 0;
    const selectedCount = selectedCategories.length;
    
    if (selectedCount === 0 || totalIncome === 0) return;

    const equalAmount = Math.floor(totalIncome / selectedCount);
    const newLimits = {};
    
    selectedCategories.forEach(categoryId => {
      newLimits[categoryId] = equalAmount.toString();
    });
    
    setCategoryLimits(newLimits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const totalIncome = parseFloat(budgetLimit);
      
      // Формируем лимиты для выбранных категорий
      // Согласно Postman коллекции, API ожидает 'PERCENT' или 'ABSOLUTE' в верхнем регистре
      const limits = selectedCategories.map(categoryId => {
        const limitValue = parseFloat(categoryLimits[categoryId]) || 0;
        
        // Рассчитываем процент от общего дохода для лимита
        const percentage = (limitValue / totalIncome) * 100;
        
        return {
          categoryId,
          limitValue: percentage, // Используем процент
          limitType: 'PERCENT' // Указываем тип как 'PERCENT'
        };
      });

      const budgetData = {
        year,
        month,
        totalIncome,
        limits
      };

      console.log('Отправка данных бюджета:', budgetData);

      const response = await budgetService.createOrUpdateBudget(budgetData);
      
      // Сохраняем данные для отображения
      localStorage.setItem('hasBudget', 'true');
      localStorage.setItem('budgetName', budgetName);
      localStorage.setItem('budgetLimit', budgetLimit);
      localStorage.setItem('budgetYear', year.toString());
      localStorage.setItem('budgetMonth', month.toString());
      localStorage.setItem('budgetId', response.id?.toString() || '');
      
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Ошибка при создании бюджета:', error);

      if (error.code === 400) {
        setServerError('Ошибка валидации: ' + (error.message || 'Проверьте введенные данные'));
      } else if (error.code === 401) {
        setServerError('Ошибка авторизации');
      } else if (error.code === 404) {
        setServerError('Сервер не найден');
      } else if (error.code === 500) {
        setServerError('Ошибка сервера. Попробуйте позже');
      } else if (error.message) {
        setServerError(error.message);
      } else {
        setServerError('Произошла ошибка при создании бюджета');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="create-budget-page">
      <Header />
      
      <main className="create-budget-main">
        <div className="create-budget-container">
          <div className="create-budget-card">
            <div className="budget-header">
              <button 
                type="button"
                onClick={handleBack}
                className="back-button"
                disabled={isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 4L6 8L10 12" stroke="#333333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="budget-title">Создать бюджет</h1>
            </div>
            
            {(error || serverError) && (
              <div className={`error-message ${serverError ? 'server-error' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="#FF4444" strokeWidth="2"/>
                  <path d="M10 6V11" stroke="#FF4444" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="10" cy="14" r="1" fill="#FF4444"/>
                </svg>
                <span>{error || serverError}</span>
              </div>
            )}
            
            <form 
              onSubmit={handleSubmit} 
              className="create-budget-form"
            >
              {/* Основная информация */}
              <div className="form-section">
                <div className="section-header">
                  <h2 className="section-title">Основная информация</h2>
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">
                    <span className="label-text">Название бюджета</span>
                  </label>
                  <div className="input-container full-width-input">
                    <input
                      type="text"
                      value={budgetName}
                      onChange={(e) => setBudgetName(e.target.value)}
                      className="form-input"
                      placeholder="Например, Основной бюджет на ноябрь"
                      required
                      disabled={isLoading}
                      maxLength={50}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group-half">
                    <label className="form-label">
                      <span className="label-text">Период</span>
                    </label>
                    <div className="period-selectors">
                      <div className="period-selector">
                        <select
                          value={month}
                          onChange={(e) => setMonth(parseInt(e.target.value))}
                          className="form-select"
                          disabled={isLoading}
                        >
                          {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {new Date(0, i).toLocaleString('ru', { month: 'long' })}
                            </option>
                          ))}
                        </select>
                        <svg className="dropdown-icon" width="12" height="8" viewBox="0 0 12 8" fill="none">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="period-selector">
                        <input
                          type="number"
                          value={year}
                          onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                          className="form-input"
                          placeholder="Год"
                          min="2020"
                          max="2030"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group-half">
                    <label className="form-label">
                      <span className="label-text">Общий доход</span>
                      <span className="label-required">*</span>
                    </label>
                    <div className="input-container with-currency full-width-input">
                      <input
                        type="number"
                        value={budgetLimit}
                        onChange={(e) => setBudgetLimit(e.target.value)}
                        className="form-input"
                        placeholder="0"
                        min="0"
                        step="100"
                        required
                        disabled={isLoading}
                        inputMode="decimal"
                      />
                      <span className="currency-symbol">₽</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Распределение по категориям */}
              <div className="form-section">
                <div className="section-header">
                  <h2 className="section-title">Распределение по категориям</h2>
                </div>

                <div className="distribution-header">
                  <div className="distribution-info">
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Выбрано:</span>
                        <span className="info-value">{selectedCategories.length} категорий</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Распределено:</span>
                        <span className="info-value">
                          {Object.values(categoryLimits).reduce((sum, limit) => sum + (parseFloat(limit) || 0), 0).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Остаток:</span>
                        <span className={`info-value ${calculateRemainingAmount() < 0 ? 'negative' : ''}`}>
                          {calculateRemainingAmount().toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCategories.length > 0 && (
                    <button
                      type="button"
                      className="auto-distribute-btn"
                      onClick={handleAutoDistribute}
                      disabled={isLoading || !budgetLimit}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Распределить поровну
                    </button>
                  )}
                </div>

                {/* Поиск категорий */}
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <svg className="search-icon" width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="8" cy="8" r="7" stroke="#666666" strokeWidth="2"/>
                      <path d="M13 13L16 16" stroke="#666666" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <input
                      type="text"
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      placeholder="Найти категорию..."
                      className="search-input"
                      disabled={isLoading}
                    />
                    {searchCategory && (
                      <button
                        type="button"
                        className="clear-search"
                        onClick={() => setSearchCategory('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Список категорий */}
                <div className="categories-container">
                  {categoriesLoading ? (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <span>Загружаем категории...</span>
                    </div>
                  ) : filteredCategories.length === 0 ? (
                    <div className="empty-state">
                      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="22" stroke="#EAEAEA" strokeWidth="2"/>
                        <path d="M16 24H32" stroke="#EAEAEA" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M24 16V32" stroke="#EAEAEA" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      <p>Категории не найдены</p>
                    </div>
                  ) : (
                    <div className="categories-grid">
                      {filteredCategories.map(category => {
                        const isSelected = selectedCategories.includes(category.id);
                        const limitValue = categoryLimits[category.id] || '';
                        const percentage = budgetLimit 
                          ? ((parseFloat(limitValue) || 0) / parseFloat(budgetLimit) * 100).toFixed(1)
                          : 0;

                        return (
                          <div 
                            key={category.id} 
                            className={`category-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => !isLoading && handleCategoryToggle(category.id)}
                          >
                            <div className="category-header">
                              <div className="category-checkbox">
                                <div className={`checkbox ${isSelected ? 'checked' : ''}`}>
                                  {isSelected && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                      <path d="M1 4L4 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                                <div className="category-info">
                                  <h4 className="category-name">{category.name}</h4>
                                  {category.description && (
                                    <p className="category-description">{category.description}</p>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <div className="category-limit-input">
                                  <div className="limit-input-wrapper">
                                    <input
                                      type="number"
                                      value={limitValue}
                                      onChange={(e) => handleLimitChange(category.id, e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      placeholder="0"
                                      min="0"
                                      step="100"
                                      className="limit-input"
                                      disabled={isLoading}
                                    />
                                    <span className="limit-currency">₽</span>
                                  </div>
                                  {percentage > 0 && (
                                    <div className="limit-percentage">{percentage}%</div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {isSelected && (
                              <div className="category-footer">
                                <div className="limit-indicator">
                                  <div 
                                    className="limit-bar"
                                    style={{
                                      width: `${Math.min(percentage, 100)}%`,
                                      backgroundColor: percentage > 100 ? '#FF4444' : '#FFDD2D'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопка создания */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className={`submit-button full-width-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading || !budgetName || !budgetLimit}
                >
                  {isLoading ? (
                    <>
                      <div className="button-spinner"></div>
                      Создание...
                    </>
                  ) : (
                    'Создать бюджет'
                  )}
                </button>
                <div className="form-hint">
                  Бюджет будет создан на {month} месяц {year} года
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateBudgetForm;