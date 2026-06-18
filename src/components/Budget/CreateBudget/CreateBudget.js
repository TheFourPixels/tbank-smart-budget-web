import React, { useState, useEffect, useRef } from 'react';
import './CreateBudget.css';
import Header from '../Header/Header';
import CategoryCard from '../../Categories/CategoryCard';
import { budgetService } from '../../../services/BudgetService.js';
import { categoryService } from '../../../services/CategoryService.js';
import { useNavigate } from 'react-router-dom';

const BudgetApp = () => {
  const navigate = useNavigate();
  const [budgetAmount, setBudgetAmount] = useState('150000');
  const [activeStep, setActiveStep] = useState(1);
  const [isScrolled, setIsScrolled] = useState(false);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = useRef({});
  
  const months = [
    { value: '01', label: 'Январь' },
    { value: '02', label: 'Февраль' },
    { value: '03', label: 'Март' },
    { value: '04', label: 'Апрель' },
    { value: '05', label: 'Май' },
    { value: '06', label: 'Июнь' },
    { value: '07', label: 'Июль' },
    { value: '08', label: 'Август' },
    { value: '09', label: 'Сентябрь' },
    { value: '10', label: 'Октябрь' },
    { value: '11', label: 'Ноябрь' },
    { value: '12', label: 'Декабрь' },
  ];
  
  useEffect(() => {
    loadCategories();
    setYear(new Date().getFullYear().toString());
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      const categoriesList = response.content || [];
      const formattedCategories = categoriesList.map(category => ({
        id: category.id,
        name: category.name,
        amount: 0,
        color: '#428bf9'
      }));
      setCategories(formattedCategories);
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      
      const defaultCategories = [
        { id: 1, name: 'Транспорт', amount: 0, color: '#428bf9' },
        { id: 2, name: 'Продукты', amount: 0, color: '#428bf9' },
        { id: 3, name: 'Развлечения', amount: 0, color: '#428bf9' },
        { id: 4, name: 'Жилье', amount: 0, color: '#428bf9' },
        { id: 5, name: 'Здоровье', amount: 0, color: '#428bf9' },
        { id: 6, name: 'Одежда', amount: 0, color: '#428bf9' },
        { id: 7, name: 'Образование', amount: 0, color: '#428bf9' },
        { id: 8, name: 'Рестораны', amount: 0, color: '#428bf9' },
      ];
      setCategories(defaultCategories);
    }
  };

  const handleNextStep = () => {
    if (activeStep === 1 && month && year && budgetAmount) {
      setActiveStep(2);
    } else {
      setTimeout(() => setError(''), 3000);
    }
  };
  
  const handleCreateBudget = async () => {
    if (!month || !year || !budgetAmount) {
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const totalIncome = parseFloat(budgetAmount.replace(/\s/g, ''));
      const selectedCategories = categories.filter(cat => cat.amount > 0);
      
      if (selectedCategories.length === 0) {
        setLoading(false);
        setTimeout(() => setError(''), 3000);
        return;
      }

      const limits = selectedCategories.map(category => ({
        categoryId: category.id,
        limitValue: category.amount,
        limitType: 'SUM'
      }));

      const budgetData = {
        year: parseInt(year),
        month: parseInt(month),
        totalIncome: totalIncome,
        limits: limits
      };

      await budgetService.createOrUpdateBudget(budgetData);
      
      localStorage.setItem('hasBudget', 'true');
      localStorage.setItem('budgetName', `Бюджет на ${getMonthName(month)} ${year}`);
      localStorage.setItem('budgetLimit', budgetAmount);
      localStorage.setItem('budgetYear', year);
      localStorage.setItem('budgetMonth', month);
      
      navigate('/budget');
      
    } catch (err) {
      console.error('Ошибка создания бюджета:', err);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };
  
  const getMonthName = (monthValue) => {
    const month = months.find(m => m.value === monthValue);
    return month ? month.label : '';
  };
  
  const handleCategoryAmountChange = (id, amount) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, amount: parseInt(amount) || 0 } : cat
    ));
  };
  
  const handleCategoryClick = (categoryId) => {
    const input = inputRefs.current[categoryId];
    if (input) {
      input.focus();
      input.select();
    }
  };
  
  const formatBudgetAmount = (value) => {
    return new Intl.NumberFormat('ru-RU').format(value.replace(/\s/g, ''));
  };
  
  const handleBudgetAmountChange = (e) => {
    const value = e.target.value.replace(/\s/g, '');
    if (/^\d*$/.test(value)) {
      setBudgetAmount(value);
    }
  };
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const benefits = [
    {
      id: 1,
      icon: 'transparency',
      title: 'Прозрачность',
      description: 'Способ видеть свои доходы и расходы'
    },
    {
      id: 2,
      icon: 'protection',
      title: 'Помощь',
      description: 'От совершения импульсивных покупок'
    },
    {
      id: 3,
      icon: 'planning',
      title: 'План',
      description: 'Цели, лимиты и система приоритетов'
    }
  ];
  
  const steps = [
    { number: 1, label: 'Общая информация', active: activeStep === 1 },
    { number: 2, label: 'Категории', active: activeStep === 2 }
  ];

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="budget-app">
      <Header />
      
      <main className="main-content">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}
        
        <h1 className="page-title text-center">
          Создайте свой первый умный бюджет
        </h1>
        
        <section className="benefits-section">
          <div className="benefits-grid">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="benefit-card">
                <div 
                  className={`benefit-icon icon-${benefit.icon}`}
                  aria-label={`Иконка ${benefit.title.toLowerCase()}`}
                >
                  <div className="icon-square"></div>
                </div>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-description">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        {activeStep === 1 ? (
          <section className="budget-form-section">
            <div className="form-background-overlay"></div>
            <div className="budget-form-container">
              <div className="budget-form">
                <div className="form-steps">
                  {steps.map((step) => (
                    <div 
                      key={step.number} 
                      className={`step ${step.active ? '' : 'step-inactive'}`}
                    >
                      <div className="step-circle">
                        <div className="step-circle-inner">{step.number}</div>
                      </div>
                      <span className="step-label">{step.label}</span>
                    </div>
                  ))}
                </div>
                
                <h2 className="form-title">Создайте бюджет</h2>
                
                <div className="form-fields">
                  <div className="form-field">
                    <label className="field-label">Сумма бюджета</label>
                    <div className="field-input">
                      <input
                        type="text"
                        className="input-value"
                        value={formatBudgetAmount(budgetAmount)}
                        onChange={handleBudgetAmountChange}
                        placeholder="Введите сумму"
                      />
                    </div>
                  </div>
                  
                  <div className="period-fields-vertical">
                    <div className="period-field-wrapper">
                      <select
                        className="period-input"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                      >
                        <option value="" disabled>Месяц</option>
                        {months.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="period-field-wrapper">
                      <input 
                        type="text" 
                        className="period-input" 
                        placeholder="Год"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-submit">
                  <button 
                    className="btn-primary" 
                    type="button"
                    onClick={handleNextStep}
                    disabled={loading}
                  >
                    Далее
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="budget-form-section">
            <div className="form-background-overlay"></div>
            <div className="budget-form-container">
              <div className="budget-form">
                <div className="form-steps">
                  {steps.map((step) => (
                    <div 
                      key={step.number} 
                      className={`step ${step.active ? '' : 'step-inactive'}`}
                    >
                      <div className="step-circle">
                        <div className="step-circle-inner">{step.number}</div>
                      </div>
                      <span className="step-label">{step.label}</span>
                    </div>
                  ))}
                </div>
                
                <h2 className="form-title">Выберите категории бюджета</h2>
                
                <input
                  type="text"
                  placeholder="Название категории"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="categories-grid2">
                  {filteredCategories.slice(0, 6).map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onAmountChange={handleCategoryAmountChange}
                      onCategoryClick={handleCategoryClick}
                      setInputRef={(el) => (inputRefs.current[category.id] = el)}
                    />
                  ))}
                </div>
                
                <div className="form-submit">
                  <button 
                    className="btn-primary" 
                    type="button"
                    onClick={handleCreateBudget}
                    disabled={loading}
                  >
                    {loading ? 'Создание...' : 'Создать бюджет'}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default BudgetApp;