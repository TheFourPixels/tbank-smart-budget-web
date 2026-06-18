import React, { useState, useEffect, useRef } from 'react';
import './Transactions.css';
import Header from '../Budget/Header/Header';
import Transaction from './Transaction';
import { FaSearch } from 'react-icons/fa';
import { FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { transactionService } from '../../services/TransactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarView, setCalendarView] = useState('month'); // 'month' или 'year'

  // Поля формы
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState('EXPENSE');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  const calendarRef = useRef(null);

  useEffect(() => {
    loadTransactions();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadCategories();
  }, []);

  // Закрытие календаря при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
        setCalendarView('month');
      }
    };

    if (showCalendar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const data = await transactionService.getCategories();
      if (data && Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
        const mockCategories = transactionService.getMockCategories();
        setCategories(mockCategories);
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      const mockCategories = transactionService.getMockCategories();
      setCategories(mockCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDateMillis = new Date(selectedYear, selectedMonth - 1, 1).getTime();
      const endDateMillis = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999).getTime();
      
      const response = await transactionService.getTransactions({
        page: 0,
        size: 100,
        startDateMillis: startDateMillis,
        endDateMillis: endDateMillis
      });
      
      const dataContent = (response && response.content) ? response.content : [];
      
      const formattedTransactions = dataContent.map(tx => ({
        id: tx.id || Math.random(),
        title: tx.description || tx.merchantName || 'Без названия',
        subtitle: tx.category?.name || '',
        amount: Math.abs(tx.amount || 0).toString(),
        type: tx.type === 'EXPENSE' ? 'negative' : 'positive',
        icon: tx.category?.id ? `icon_${tx.category.id}` : 'default_icon',
        date: tx.transactionDate ? tx.transactionDate.split('T')[0] : new Date().toISOString().split('T')[0],
        rawAmount: tx.amount
      }));
      
      setTransactions(formattedTransactions);
    } catch (err) {
      console.error('Ошибка загрузки транзакций:', err);
      setError('Не удалось загрузить транзакции');
      const mockData = transactionService.getMockTransactions();
      const formattedTransactions = mockData.content.map(tx => ({
        id: tx.id || Math.random(),
        title: tx.description || 'Без названия',
        subtitle: tx.category?.name || 'Без категории',
        amount: Math.abs(tx.amount || 0).toString(),
        type: tx.type === 'EXPENSE' ? 'negative' : 'positive',
        icon: tx.category?.id ? `icon_${tx.category.id}` : 'default_icon',
        date: tx.transactionDate ? tx.transactionDate.split('T')[0] : new Date().toISOString().split('T')[0],
        rawAmount: tx.amount
      }));
      setTransactions(formattedTransactions);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
    
    if (type === 'INCOME') {
      const incomeCategory = categories.find(cat => 
        cat.name.toLowerCase() === 'доход' || 
        cat.name.toLowerCase() === 'income'
      );
      
      if (incomeCategory) {
        setCategory(incomeCategory.id);
        setCategorySearch(incomeCategory.name);
      } else {
        setCategory('INCOME_CATEGORY');
        setCategorySearch('Доход');
      }
      setShowCategoryDropdown(false);
    } else {
      setCategory('');
      setCategorySearch('');
    }
  };

  const handleAddTransaction = async () => {
    if (!amount) {
      alert('Пожалуйста, заполните сумму');
      return;
    }

    if (transactionType === 'EXPENSE' && !category) {
      alert('Пожалуйста, выберите категорию');
      return;
    }

    try {
      const categoryId = transactionType === 'INCOME' 
        ? categories.find(cat => cat.name.toLowerCase() === 'доход')?.id || null
        : (isNaN(parseInt(category)) ? null : parseInt(category));
      
      const selectedCategoryObj = categories.find(cat => cat.id == category);
      const amountValue = parseFloat(amount);
      const finalAmount = transactionType === 'EXPENSE' ? -Math.abs(amountValue) : Math.abs(amountValue);
      
      const transactionData = {
        amount: finalAmount,
        description: description || (selectedCategoryObj ? selectedCategoryObj.name : 'Операция'),
        categoryId: categoryId,
        transactionTime: new Date().toISOString(),
        type: transactionType
      };

      await transactionService.createTransaction(transactionData);
      
      setAmount('');
      setCategory('');
      setDescription('');
      setCategorySearch('');
      setShowCategoryDropdown(false);
      setTransactionType('EXPENSE');
      
      loadTransactions();
    } catch (err) {
      console.error('Ошибка добавления транзакции:', err);
      alert('Не удалось добавить транзакцию');
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategorySelect = (categoryId, categoryName) => {
    setCategory(categoryId);
    setCategorySearch(categoryName);
    setShowCategoryDropdown(false);
  };

  const groupedTransactions = transactions.reduce((acc, transaction) => {
    const date = transaction.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(transaction);
    return acc;
  }, {});

  const sortedGroups = Object.keys(groupedTransactions)
    .sort((a, b) => new Date(b) - new Date(a))
    .map(date => ({
      date,
      transactions: groupedTransactions[date]
    }));

  const formatDate = (dateString) => {
    if (!dateString) return 'Без даты';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return new Intl.DateTimeFormat('ru-RU', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).format(date);
    }
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const shortMonthNames = [
    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
  ];

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Генерация дней для календаря
  const getCalendarDays = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Пустые ячейки до первого дня
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDayClick = (day) => {
    if (day) {
      setSelectedMonth(selectedMonth);
      setSelectedYear(selectedYear);
      setShowCalendar(false);
      setCalendarView('month');
    }
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setCalendarView('month');
  };

  const handleMonthSelect = (month) => {
    setSelectedMonth(month + 1);
    setCalendarView('month');
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
    setShowCalendar(false);
    setCalendarView('month');
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           selectedMonth === today.getMonth() + 1 && 
           selectedYear === today.getFullYear();
  };

  const totalIncome = transactions
    .filter(t => t.type === 'positive')
    .reduce((sum, t) => sum + Math.abs(t.rawAmount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'negative')
    .reduce((sum, t) => sum + Math.abs(t.rawAmount), 0);

  if (loading && transactions.length === 0) {
    return (
      <>
        <Header />
        <div className="dashboard">
          <div className="dashboard__container">
            <div className="dashboard__operations">
              <h1 className="operations__title">Операции</h1>
              <div className="loading">Загрузка...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const isIncome = transactionType === 'INCOME';
  const calendarDays = getCalendarDays();

  return (
    <>
      <Header />
      <section id="section-dashboard" className="dashboard">
        <div className="dashboard__container">
          <div className="dashboard__operations">
            <h1 className="operations__title">Операции</h1>

            <div className="operations__search search">
              <FaSearch className="search-icon" />
              <input type="text" placeholder="Поиск" className="search__input" />
            </div>

            {/* Календарь и фильтр даты */}
            <div className="operations__filter filter" ref={calendarRef}>
              <button 
                className={`filter__button ${showCalendar ? 'active' : ''}`}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <span className="filter__text">{monthNames[selectedMonth - 1]} {selectedYear}</span>
                <FaChevronDown className={`filter__chevron ${showCalendar ? 'rotated' : ''}`} />
              </button>

              {showCalendar && (
                <div className="calendar-dropdown">
                  {calendarView === 'month' ? (
                    <>
                      {/* Шапка календаря */}
                      <div className="calendar__header">
                        <button 
                          className="calendar__nav-btn"
                          onClick={handlePrevMonth}
                        >
                          <FaChevronLeft />
                        </button>
                        <button 
                          className="calendar__title"
                          onClick={() => setCalendarView('year')}
                        >
                          {monthNames[selectedMonth - 1]} {selectedYear}
                        </button>
                        <button 
                          className="calendar__nav-btn"
                          onClick={handleNextMonth}
                        >
                          <FaChevronRight />
                        </button>
                      </div>

                      {/* Дни недели */}
                      <div className="calendar__weekdays">
                        {dayNames.map(day => (
                          <div key={day} className="calendar__weekday">{day}</div>
                        ))}
                      </div>

                      {/* Дни месяца */}
                      <div className="calendar__days">
                        {calendarDays.map((day, index) => (
                          <div 
                            key={index} 
                            className={`calendar__day ${day ? '' : 'empty'} ${day && isToday(day) ? 'today' : ''}`}
                            onClick={() => handleDayClick(day)}
                          >
                            {day}
                          </div>
                        ))}
                      </div>

                      {/* Кнопка "Текущий месяц" */}
                      <button 
                        className="calendar__current-btn"
                        onClick={handleCurrentMonth}
                      >
                        Текущий месяц
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Вид выбора года */}
                      <div className="calendar__header">
                        <button 
                          className="calendar__nav-btn"
                          onClick={() => setSelectedYear(selectedYear - 12)}
                        >
                          <FaChevronLeft />
                        </button>
                        <span className="calendar__title">
                          {selectedYear - 6} - {selectedYear + 5}
                        </span>
                        <button 
                          className="calendar__nav-btn"
                          onClick={() => setSelectedYear(selectedYear + 12)}
                        >
                          <FaChevronRight />
                        </button>
                      </div>

                      <div className="calendar__years-grid">
                        {[...Array(12)].map((_, i) => {
                          const year = selectedYear - 6 + i;
                          return (
                            <button
                              key={year}
                              className={`calendar__year-btn ${year === selectedYear ? 'active' : ''}`}
                              onClick={() => {
                                setSelectedYear(year);
                                setCalendarView('month');
                              }}
                            >
                              {year}
                            </button>
                          );
                        })}
                      </div>

                      <div className="calendar__months-grid">
                        {shortMonthNames.map((name, index) => (
                          <button
                            key={index}
                            className={`calendar__month-btn ${index + 1 === selectedMonth ? 'active' : ''}`}
                            onClick={() => handleMonthSelect(index)}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="operations__summary summary">
              <div className="summary__card summary__card--expenses">
                <div className="summary__card-content">
                  <div className="summary__amount">{totalExpense.toLocaleString('ru-RU')} ₽</div>
                  <div className="summary__label">Траты</div>
                  <div className="summary__progress summary__progress--purple"></div>
                </div>
              </div>
              <div className="summary__card summary__card--income">
                <div className="summary__card-content">
                  <div className="summary__amount">{totalIncome.toLocaleString('ru-RU')} ₽</div>
                  <div className="summary__label">Доходы</div>
                  <div className="summary__progress summary__progress--blue"></div>
                </div>
              </div>
            </div>

            <div className="operations__transactions transactions">
              {error && <div className="error-message">{error}</div>}
              
              {sortedGroups.length > 0 ? (
                sortedGroups.map(group => (
                  <React.Fragment key={group.date}>
                    <h3 className="transactions__date-header">{formatDate(group.date)}</h3>
                    {group.transactions.map(transaction => (
                      <Transaction
                        key={transaction.id}
                        title={transaction.title}
                        subtitle={transaction.subtitle}
                        amount={transaction.amount}
                        type={transaction.type}
                        icon={transaction.icon}
                      />
                    ))}
                  </React.Fragment>
                ))
              ) : (
                !loading && <div className="no-transactions">Нет транзакций за выбранный период</div>
              )}
            </div>
          </div>

          <aside className="dashboard__sidebar sidebar">
            <div className="sidebar__card add-card">
              <h2 className="add-card__title">Добавить операцию</h2>
              <div className="add-card__form">
                
                {/* Переключатель Доход/Расход */}
                <div className="add-card__type-selector">
                  <button
                    type="button"
                    className={`type-btn type-btn--expense ${transactionType === 'EXPENSE' ? 'active' : ''}`}
                    onClick={() => handleTransactionTypeChange('EXPENSE')}
                  >
                    Расход
                  </button>
                  <button
                    type="button"
                    className={`type-btn type-btn--income ${transactionType === 'INCOME' ? 'active' : ''}`}
                    onClick={() => handleTransactionTypeChange('INCOME')}
                  >
                    Доход
                  </button>
                </div>

                <div className="add-card__input-group">
                  <div className="add-card__input-wrapper">
                    <input 
                      type="number" 
                      placeholder="Сумма" 
                      className="add-card__input" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="add-card__input-wrapper category-selector">
                    <input
                      type="text"
                      placeholder={
                        isIncome 
                          ? 'Доход' 
                          : (categoriesLoading ? "Загрузка категорий..." : "Категория")
                      }
                      className={`add-card__input ${isIncome ? 'category-locked' : ''}`}
                      value={categorySearch}
                      onChange={(e) => {
                        if (!isIncome) {
                          setCategorySearch(e.target.value);
                          setShowCategoryDropdown(true);
                        }
                      }}
                      onFocus={() => {
                        if (!isIncome) {
                          setShowCategoryDropdown(true);
                        }
                      }}
                      onClick={() => {
                        if (!isIncome) {
                          setShowCategoryDropdown(true);
                        }
                      }}
                      readOnly={isIncome}
                      disabled={isIncome}
                    />
                   
                    
                    {!isIncome && showCategoryDropdown && (
                      <div className="category-dropdown">
                        {categoriesLoading ? (
                          <div className="category-item">Загрузка...</div>
                        ) : filteredCategories.length > 0 ? (
                          filteredCategories.map(cat => (
                            <div 
                              key={cat.id}
                              className="category-item"
                              onClick={() => handleCategorySelect(cat.id, cat.name)}
                            >
                              <span className="category-color-dot" style={{backgroundColor: cat.color || '#ccc'}}></span>
                              {cat.name}
                            </div>
                          ))
                        ) : (
                          <div className="category-item no-results">
                            Категории не найдены
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="add-card__input-wrapper">
                    <input
                      type="text"
                      placeholder="Описание (необязательно)"
                      className="add-card__input"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <button className="add-card__button" onClick={handleAddTransaction}>
                  Добавить операцию
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Transactions;
