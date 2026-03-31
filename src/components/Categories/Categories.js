import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Budget/Header/Header';
import { categoryService } from '../../services/CategoryService';
import { budgetService } from '../../services/BudgetService';
import './Categories.css';
import CategoryCard from './CategoryCard';
import CreateCategory from './CreateCategory';

const Categories = () => {
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
  }, []);

const loadCategories = async () => {
  setLoading(true);
  setError(null);
  try {
    let allCategories = [];
    let page = 0;
    let totalPages = 1;
    
    while (page < totalPages) {
      const response = await categoryService.getCategories({
        page: page,
        size: 10
      });
      
      const categories = response.content || [];
      allCategories = [...allCategories, ...categories];
      
      totalPages = response.totalPages;
      page++;
    }
    
    const formattedCategories = allCategories.map(category => ({
      id: category.id,
      name: category.name,
      color: '#428bf9',
      twoLines: category.name && category.name.length > 15,
      isInBudget: false,
      limit: 0,
      limit_type: 'SUM',
      amount: 0,
    }));
    
    setCategories(formattedCategories);
  } catch (err) {
    console.error('Ошибка загрузки категорий:', err);
    setError('Не удалось загрузить категории. Пожалуйста, попробуйте позже.');
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
      
      if (err.status === 404) {
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
        const limitInfo = limits.find(limit => limit.categoryId === category.id);
        if (limitInfo) {
          return {
            ...category,
            isInBudget: true,
            limit: limitInfo.limitValue || 0,
            limit_type: limitInfo.limitType || 'SUM',
            amount: limitInfo.limitValue || 0,
          };
        }
        return category;
      });
    });
  };

  const handleCategoryClick = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    
    if (category && category.isInBudget) {
      return;
    }

    setAddingToBudget(prev => ({ ...prev, [categoryId]: true }));

    try {
      const newLimit = {
        categoryId: categoryId,
        limitValue: 0,
        limitType: "SUM"
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
                limit_type: 'SUM',
                amount: 0
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
      limit.categoryId === categoryId 
        ? { ...limit, limitValue: limitValue }
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
            ? { ...cat, limit: limitValue, amount: limitValue }
            : cat
        )
      );
    } catch (err) {
      console.error('Ошибка обновления лимита:', err);
      setError('Не удалось обновить лимит');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    try {
      setLoading(true);
      await categoryService.createCategory({
        name: categoryData.name,
      });
      await loadCategories();
    } catch (err) {
      console.error('Ошибка создания категории:', err);
      setError('Не удалось создать категорию');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAndAddToBudget = async (budgetData) => {
  try {
    setLoading(true);
    
    const newCategory = await categoryService.createCategory({
      name: budgetData.name,
    });
    
    if (budgetData.limitValue > 0) {
      const newLimit = {
        categoryId: newCategory.id,
        limitValue: budgetData.limitValue,
        limitType: budgetData.limitType
      };

      const currentLimits = budgetLimits || [];
      const updatedLimits = [...currentLimits, newLimit];

      const budgetDataToSend = {
        year: currentYear,
        month: currentMonth,
        totalIncome: currentBudget ? currentBudget.totalIncome : 0,
        limits: updatedLimits
      };

      const response = await budgetService.createOrUpdateBudget(budgetDataToSend);
      
      setCurrentBudget(response);
      setBudgetLimits(response.limits || []);
      
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === newCategory.id 
            ? { 
                ...cat, 
                isInBudget: true, 
                limit: budgetData.limitValue,
                limit_type: budgetData.limitType,
                amount: budgetData.limitValue
              } 
            : cat
        )
      );
    }
    
    await loadCategories();
    
  } catch (err) {
    console.error('Ошибка создания категории и добавления в бюджет:', err);
    setError('Не удалось создать категорию или добавить в бюджет');
    setTimeout(() => setError(null), 3000);
  } finally {
    setLoading(false);
  }
};



  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page">
      <Header />
      <main className="main">
        <div className="container main__container">
          <h2 className="main__title">Категории</h2>
          <section className="available-section">
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

            <div className="categories-grid">
              {filteredCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onAmountChange={(id, amount) => handleLimitChange(id, amount.toString())}
                  onCategoryClick={handleCategoryClick}
                  addingToBudget={addingToBudget[category.id]}
                />
              ))}
            </div>

<CreateCategory 
  onCreateCategory={handleCreateCategory} 
  onAddToBudget={handleCreateAndAddToBudget}
/>          </section>
        </div>
      </main>
    </div>
  );
};

export default Categories;
