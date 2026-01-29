import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Budget/Header/Header';
import { transactionService } from '../../services/TransactionService';
import { categoryService } from '../../services/CategoryService';
import './TransactionsPage.css';

const TransactionsPage = () => {
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [filters, setFilters] = useState({
    categoryId: '',
    page: 0,
    size: 10,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    sort: 'date,desc'
  });
  
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0
  });
  
  const [stats, setStats] = useState({
    totalSpent: 0,
    transactionCount: 0,
    averageTransaction: 0,
    totalIncome: 0
  });
  
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'EXPENSE',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    merchant: ''
  });

  useEffect(() => {
    loadCategories();
    loadTransactions();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories();
      setCategories(response.content || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setCategories(getMockCategories());
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await transactionService.getTransactions(filters);
      
      if (response && response.content) {
        setTransactions(response.content);
        setPagination({
          totalPages: response.totalPages || 0,
          totalElements: response.totalElements || 0,
          currentPage: response.number || 0
        });
        calculateStats(response.content);
      } else {
        setTransactions(response || []);
        setPagination({
          totalPages: 1,
          totalElements: (response || []).length,
          currentPage: 0
        });
        calculateStats(response || []);
      }
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Не удалось загрузить транзакции');
      setTransactions(getMockTransactions());
      setPagination({
        totalPages: 1,
        totalElements: getMockTransactions().length,
        currentPage: 0
      });
      calculateStats(getMockTransactions());
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (transactionsList) => {
    if (!transactionsList || transactionsList.length === 0) {
      setStats({
        totalSpent: 0,
        transactionCount: 0,
        averageTransaction: 0,
        totalIncome: 0
      });
      return;
    }

    const expenseTransactions = transactionsList.filter(t => !t.isIncome);
    const incomeTransactions = transactionsList.filter(t => t.isIncome);
    
    const totalSpent = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const transactionCount = expenseTransactions.length;
    const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    setStats({
      totalSpent,
      transactionCount,
      averageTransaction,
      totalIncome
    });
  };

  const handleSyncTransactions = async () => {
    setSyncing(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await transactionService.syncTransactions(filters.year, filters.month);
      setSuccessMessage('Синхронизация запущена');
      setTimeout(() => {
        loadTransactions();
        setSuccessMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Error syncing transactions:', err);
      setError('Не удалось запустить синхронизацию');
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingTransaction || !selectedCategoryId) return;
    
    try {
      await transactionService.updateTransactionCategory(
        editingTransaction.id,
        parseInt(selectedCategoryId)
      );
      
      setSuccessMessage('Категория обновлена');
      setShowEditModal(false);
      setEditingTransaction(null);
      setSelectedCategoryId('');
      
      setTimeout(() => {
        loadTransactions();
        setSuccessMessage(null);
      }, 500);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Не удалось обновить категорию');
    }
  };

const handleAddTransaction = async () => {
  try {
    // Проверяем обязательные поля
    if (!newTransaction.amount || !newTransaction.description) {
      setError('Заполните обязательные поля: сумма и описание');
      return;
    }

    // Форматируем дату в правильный формат (ISO без миллисекунд)
    const formatDateForAPI = (dateString) => {
      const date = new Date(dateString);
      // Формат: YYYY-MM-DDTHH:mm:ssZ
      return date.toISOString().split('.')[0] + 'Z';
    };

    // Подготавливаем данные в формате API
    const transactionData = {
      transactionTime: formatDateForAPI(newTransaction.date),
      amount: parseFloat(newTransaction.amount), // Положительное число
      type: newTransaction.type, // "EXPENSE" или "INCOME"
      merchant: newTransaction.merchant || '', // Пустая строка, если нет
      categoryId: parseInt(newTransaction.categoryId) || 999, // По умолчанию 999
      description: newTransaction.description
    };

    console.log('Отправка транзакции:', transactionData);

    // Отправляем на сервер
    const response = await transactionService.createTransaction(transactionData);
    
    // Преобразуем ответ сервера в формат компонента
    // ВАЖНО: Предполагается, что сервер возвращает данные в том же формате, что и при GET запросе
    const createdTransaction = {
      id: response.id,
      amount: response.amount,
      type: response.type,
      isIncome: response.type === 'INCOME',
      description: response.description,
      date: response.transactionDate || response.transactionTime, // Обратная совместимость
      merchant: response.merchant || response.merchantName, // Обратная совместимость
      categoryId: response.category?.id || response.categoryId,
      category: response.category || { 
        id: response.categoryId || 999, 
        name: 'Не распределено', 
        system: true 
      }
    };

    // Добавляем транзакцию в начало списка
    setTransactions(prev => [createdTransaction, ...prev]);
    setSuccessMessage('Транзакция успешно добавлена');
    setShowAddModal(false);
    
    // Сброс формы
    setNewTransaction({
      amount: '',
      type: 'EXPENSE',
      description: '',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      merchant: ''
    });

    // Пересчитываем статистику
    setTimeout(() => {
      calculateStats([createdTransaction, ...transactions]);
      setSuccessMessage(null);
    }, 500);

  } catch (err) {
    console.error('Ошибка при добавлении транзакции:', err);
    
    // Если сервер возвращает ошибку, добавляем локально как запасной вариант
    addTransactionLocally();
  }
};

// Функция для локального добавления (запасной вариант)
const addTransactionLocally = () => {
  const mockTransaction = {
    id: Date.now(),
    amount: parseFloat(newTransaction.amount) * (newTransaction.type === 'EXPENSE' ? -1 : 1),
    isIncome: newTransaction.type === 'INCOME',
    description: newTransaction.description,
    date: new Date(newTransaction.date).toISOString(),
    merchant: newTransaction.merchant,
    categoryId: parseInt(newTransaction.categoryId) || 999,
    category: categories.find(c => c.id === parseInt(newTransaction.categoryId)) || 
             { id: 999, name: "Не распределено", system: true }
  };

  setTransactions(prev => [mockTransaction, ...prev]);
  setSuccessMessage('Транзакция добавлена (локально)');
  setShowAddModal(false);
  
  setNewTransaction({
    amount: '',
    type: 'EXPENSE',
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0],
    merchant: ''
  });

  setTimeout(() => {
    calculateStats([mockTransaction, ...transactions]);
    setSuccessMessage(null);
  }, 500);
};

  const handleFilterChange = (key, value) => {
    let processedValue = value;
    if (key === 'month' || key === 'year' || key === 'page' || key === 'size') {
      processedValue = parseInt(value) || 0;
    }
    
    setFilters(prev => ({ 
      ...prev, 
      [key]: processedValue, 
      page: 0
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (err) {
      return 'Неизвестно';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return '';
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Неизвестно';
  };

  const getTransactionCategoryName = (transaction) => {
    if (transaction.category && transaction.category.name) {
      return transaction.category.name;
    }
    return getCategoryName(transaction.categoryId);
  };

  const getMockCategories = () => {
    return [
      { id: 1, name: "Транспорт" },
      { id: 2, name: "Продукты" },
      { id: 3, name: "Рестораны" },
      { id: 4, name: "Развлечения" },
      { id: 5, name: "Одежда" },
      { id: 6, name: "Здоровье" },
      { id: 7, name: "Образование" },
      { id: 8, name: "Путешествия" },
      { id: 9, name: "Коммунальные услуги" },
      { id: 10, name: "Техника" },
      { id: 999, name: "Не распределено", system: true }
    ];
  };

  const getMockTransactions = () => {
    const currentDate = new Date().toISOString();
    return [
      {
        id: 1,
        description: "Покупка в Пятерочке",
        amount: -1250.50,
        isIncome: false,
        date: currentDate,
        categoryId: 2,
        merchant: "Пятерочка",
        category: { id: 2, name: "Продукты" }
      },
      {
        id: 2,
        description: "Такси до работы",
        amount: -450.00,
        isIncome: false,
        date: currentDate,
        categoryId: 1,
        merchant: "Яндекс.Такси",
        category: { id: 1, name: "Транспорт" }
      }
    ];
  };

  const handleBack = () => {
    navigate(-1);
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
      'Не распределено': '💰'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (categoryName && categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '💰';
  };

  const handleSelectChange = (e, key) => {
    handleFilterChange(key, e.target.value);
  };

  const handleNewTransactionChange = (field, value) => {
    setNewTransaction(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="transactions-page">
      <Header />
      
      <main className="transactions-main">
        <div className="breadcrumbs">
          <button onClick={handleBack} className="breadcrumb-btn">
            <svg className="breadcrumb-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Назад</span>
          </button>
        </div>
        
        <div className="page-header">
          <h1 className="page-title">Транзакции</h1>
          <p className="page-subtitle">
            {filters.month}.{filters.year} • Всего: {pagination.totalElements} транзакций
          </p>
        </div>

        {successMessage && (
          <div className="message success">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="#21A038"/>
            </svg>
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="message error">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="#FF3B30"/>
            </svg>
            {error}
          </div>
        )}

        <div className="transactions-controls">
          <div className="controls-row">
            <div className="filter-group">
              <label className="filter-label">Месяц</label>
              <select 
                className="filter-select"
                value={filters.month}
                onChange={(e) => handleSelectChange(e, 'month')}
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Год</label>
              <select 
                className="filter-select"
                value={filters.year}
                onChange={(e) => handleSelectChange(e, 'year')}
              >
                {[2023, 2024, 2025].map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Категория</label>
              <select 
                className="filter-select"
                value={filters.categoryId}
                onChange={(e) => handleSelectChange(e, 'categoryId')}
              >
                <option value="">Все категории</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Тип</label>
              <select 
                className="filter-select"
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Все типы</option>
                <option value="EXPENSE">Расходы</option>
                <option value="INCOME">Доходы</option>
              </select>
            </div>
          </div>
          
          <div className="controls-actions">
            <button 
              className="sync-btn"
              onClick={handleSyncTransactions}
              disabled={syncing || loading}
            >
              {syncing ? 'Синхронизация...' : 'Синхронизировать'}
            </button>
            <button 
              className="add-btn"
              onClick={() => setShowAddModal(true)}
            >
              + Добавить
            </button>
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.totalIncome || 0)}</div>
            <div className="stat-label">Всего доходов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.totalSpent || 0)}</div>
            <div className="stat-label">Всего расходов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.transactionCount || 0}</div>
            <div className="stat-label">Кол-во расходов</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(stats.averageTransaction || 0)}</div>
            <div className="stat-label">Средний расход</div>
          </div>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Загрузка транзакций...</p>
          </div>
        ) : (
          <>
            <div className="transactions-list">
              {transactions.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">💳</div>
                  <h3>Транзакции не найдены</h3>
                  <p>Попробуйте изменить фильтры или добавить первую транзакцию</p>
                </div>
              ) : (
                transactions.map(transaction => {
                  const isIncome = transaction.isIncome;
                  const categoryName = getTransactionCategoryName(transaction);
                  const categoryIcon = getCategoryIcon(categoryName);
                  
                  return (
                    <div 
                      key={transaction.id} 
                      className="transaction-card"
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setSelectedCategoryId(transaction.categoryId?.toString() || '');
                        setShowEditModal(true);
                      }}
                    >
                      <div className="transaction-icon">
                        <div className="icon-circle">
                          {categoryIcon}
                        </div>
                      </div>
                      
                      <div className="transaction-details">
                        <div className="transaction-header">
                          <div className="transaction-title">
                            {transaction.description || 'Без описания'}
                          </div>
                          <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
                            {formatCurrency(Math.abs(transaction.amount))}
                          </div>
                        </div>
                        
                        <div className="transaction-info">
                          <div className="transaction-category">
                            <span className="category-badge">
                              {categoryName}
                            </span>
                          </div>
                          
                          <div className="transaction-meta">
                            <span className="transaction-date">
                              {formatDate(transaction.date)} {formatTime(transaction.date) && `• ${formatTime(transaction.date)}`}
                            </span>
                            {transaction.merchant && (
                              <span className="transaction-merchant">
                                • {transaction.merchant}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 0}
                >
                  Назад
                </button>
                
                <div className="pagination-info">
                  Страница {filters.page + 1} из {pagination.totalPages}
                </div>
                
                <button 
                  className="pagination-btn"
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= pagination.totalPages - 1}
                >
                  Вперед
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Модальное окно добавления транзакции */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Новая транзакция</h3>
              <button 
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="transaction-form">
                <div className="form-group">
                  <label className="form-label">Тип операции</label>
                  <div className="type-toggle">
                    <button
                      type="button"
                      className={`type-option ${newTransaction.type === 'EXPENSE' ? 'active expense' : ''}`}
                      onClick={() => handleNewTransactionChange('type', 'EXPENSE')}
                    >
                      Расход
                    </button>
                    <button
                      type="button"
                      className={`type-option ${newTransaction.type === 'INCOME' ? 'active income' : ''}`}
                      onClick={() => handleNewTransactionChange('type', 'INCOME')}
                    >
                      Доход
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Сумма (руб.)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newTransaction.amount}
                    onChange={(e) => handleNewTransactionChange('amount', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Описание</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTransaction.description}
                    onChange={(e) => handleNewTransactionChange('description', e.target.value)}
                    placeholder="На что потратили?"
                    maxLength="100"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Категория</label>
                  <select
                    className="form-select"
                    value={newTransaction.categoryId}
                    onChange={(e) => handleNewTransactionChange('categoryId', e.target.value)}
                  >
                    <option value="">Выберите категорию</option>
                    {categories
                      .filter(category => !category.system)
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Магазин/Контрагент</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newTransaction.merchant}
                    onChange={(e) => handleNewTransactionChange('merchant', e.target.value)}
                    placeholder="Название магазина или контрагента"
                    maxLength="50"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Дата</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newTransaction.date}
                    onChange={(e) => handleNewTransactionChange('date', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => setShowAddModal(false)}
              >
                Отмена
              </button>
              <button 
                className="modal-save"
                onClick={handleAddTransaction}
                disabled={!newTransaction.amount || !newTransaction.description}
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно редактирования категории */}
      {showEditModal && editingTransaction && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Изменить категорию</h3>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                  setSelectedCategoryId('');
                }}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="edit-transaction-info">
                <div className="transaction-preview">
                  <div className={`preview-amount ${editingTransaction.isIncome ? 'income' : 'expense'}`}>
                    {formatCurrency(Math.abs(editingTransaction.amount))}
                  </div>
                  <div className="preview-description">
                    {editingTransaction.description || 'Без описания'}
                  </div>
                  <div className="preview-date">
                    {formatDate(editingTransaction.date)}
                  </div>
                  <div className="preview-merchant">
                    {editingTransaction.merchant && `Магазин: ${editingTransaction.merchant}`}
                  </div>
                </div>
                
                <div className="category-select">
                  <label className="select-label">Новая категория</label>
                  <select 
                    className="category-select-input"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                  >
                    <option value="">Выберите категорию</option>
                    {categories
                      .filter(category => !category.system)
                      .map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-cancel"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTransaction(null);
                  setSelectedCategoryId('');
                }}
              >
                Отмена
              </button>
              <button 
                className="modal-save"
                onClick={handleUpdateCategory}
                disabled={!selectedCategoryId}
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

export default TransactionsPage;