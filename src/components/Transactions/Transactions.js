import React, { useState, useEffect } from 'react';
import './Transactions.css';
import Header from '../Budget/Header/Header';
import Transaction from './Transaction';
import { FaSearch } from 'react-icons/fa';
import { FaChevronDown } from "react-icons/fa";
import { transactionService } from '../../services/TransactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, [selectedMonth, selectedYear]);

  const loadCategories = async () => {
    try {
      const categoriesData = await transactionService.getCategories();
      if (categoriesData && Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        const mockCategories = transactionService.getMockCategories();
        setCategories(mockCategories);
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
      const mockCategories = transactionService.getMockCategories();
      setCategories(mockCategories);
    }
  };

  const formatDateForApi = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  const extractDate = (dateString) => {
    if (!dateString) return new Date().toISOString().split('T')[0];
    if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      return dateString;
    }
    return new Date().toISOString().split('T')[0];
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const startDate = formatDateForApi(new Date(selectedYear, selectedMonth - 1, 1));
      const endDate = formatDateForApi(new Date(selectedYear, selectedMonth, 0));
      
      const response = await transactionService.getTransactions({
        page: 0,
        size: 100,
        startDate: startDate,
        endDate: endDate
      });
      
      if (response && response.content) {
        const formattedTransactions = response.content.map(tx => ({
          id: tx.id || Math.random(),
          title: tx.description || 'Без названия',
          subtitle: tx.category?.name || 'Без категории',
          amount: Math.abs(tx.amount || 0).toString(),
          type: (tx.amount || 0) < 0 ? 'negative' : 'positive',
          icon: tx.category?.id ? `icon_${tx.category.id}` : 'default_icon',
          date: extractDate(tx.date)
        })).filter(tx => tx.date);
        setTransactions(formattedTransactions);
      } else {
        const mockData = transactionService.getMockTransactions();
        const formattedTransactions = mockData.content.map(tx => ({
          id: tx.id || Math.random(),
          title: tx.description || 'Без названия',
          subtitle: tx.category?.name || 'Без категории',
          amount: Math.abs(tx.amount || 0).toString(),
          type: (tx.amount || 0) < 0 ? 'negative' : 'positive',
          icon: tx.category?.id ? `icon_${tx.category.id}` : 'default_icon',
          date: extractDate(tx.date)
        })).filter(tx => tx.date);
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error('Ошибка загрузки транзакций:', err);
      setError('Не удалось загрузить транзакции');
      const mockData = transactionService.getMockTransactions();
      const formattedTransactions = mockData.content.map(tx => ({
        id: tx.id || Math.random(),
        title: tx.description || 'Без названия',
        subtitle: tx.category?.name || 'Без категории',
        amount: Math.abs(tx.amount || 0).toString(),
        type: (tx.amount || 0) < 0 ? 'negative' : 'positive',
        icon: tx.category?.id ? `icon_${tx.category.id}` : 'default_icon',
        date: extractDate(tx.date)
      })).filter(tx => tx.date);
      setTransactions(formattedTransactions);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!amount || !category) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    try {
      const categoryId = isNaN(parseInt(category)) ? null : parseInt(category);
      
      const transactionData = {
        amount: parseFloat(amount),
        description: description || (categories.find(cat => cat.id == category)?.name) || 'Без названия',
        categoryId: categoryId,
        transactionTime: new Date().toISOString(),
        type: parseFloat(amount) < 0 ? 'EXPENSE' : 'INCOME'
      };

      await transactionService.createTransaction(transactionData);
      
      setAmount('');
      setCategory('');
      setDescription('');
      setCategorySearch('');
      setShowCategoryDropdown(false);
      
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

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  if (loading) {
    return (
      <>
        <Header />
        <div className="dashboard">
          <div className="dashboard__container">
            <div className="dashboard__operations">
              <h1 className="operations__title">Операции</h1>
              <div>Загрузка...</div>
            </div>
          </div>
        </div>
      </>
    );
  }

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

            <div className="operations__filter filter">
              <button className="filter__button">
                <span className="filter__text">{monthNames[selectedMonth - 1]}</span>
                <FaChevronDown />
              </button>
            </div>

            <div className="operations__summary summary">
              <div className="summary__card summary__card--expenses">
                <div className="summary__card-content">
                  <div className="summary__amount">2000 ₽</div>
                  <div className="summary__label">Траты</div>
                  <div className="summary__progress summary__progress--purple"></div>
                </div>
              </div>
              <div className="summary__card summary__card--income">
                <div className="summary__card-content">
                  <div className="summary__amount">1500 ₽</div>
                  <div className="summary__label">Доходы</div>
                  <div className="summary__progress summary__progress--blue"></div>
                </div>
              </div>
            </div>

            <div className="operations__transactions transactions">
              {error && <div className="error-message">{error}</div>}
              {sortedGroups.map(group => (
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
              ))}
              {sortedGroups.length === 0 && !loading && (
                <div className="no-transactions">Нет транзакций за выбранный период</div>
              )}
            </div>
          </div>

          <aside className="dashboard__sidebar sidebar">
            <div className="sidebar__card add-card">
              <h2 className="add-card__title">Добавить операцию</h2>
              <div className="add-card__form">
                <div className="add-card__input-group">
                  <div className="add-card__input-wrapper">
                    <input 
                      type="text" 
                      placeholder="Сумма" 
                      className="add-card__input" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="add-card__input-wrapper category-selector">
                    <input
                      type="text"
                      placeholder="Поиск категории"
                      className="add-card__input"
                      value={categorySearch}
                      onChange={(e) => {
                        setCategorySearch(e.target.value);
                        setCategory(e.target.value);
                        setShowCategoryDropdown(true);
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onClick={() => setShowCategoryDropdown(true)}
                    />
                    {showCategoryDropdown && (
                      <div className="category-dropdown">
                        {filteredCategories.length > 0 ? (
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
