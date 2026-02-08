import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/TransactionService';
import TransactionItem from './TransactionItem';
import DateFilter from './DateFilter';
import StatsCard from './StatsCard';
import styles from './TransactionsScreen.module.css';
import Header from '../Budget/Header/Header';

const TransactionsScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadData();
  }, [selectedPeriod, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, statsData] = await Promise.all([
        transactionService.getTransactions(filters),
        transactionService.getStats(selectedPeriod)
      ]);
      setTransactions(transactionsData.content || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount)) + ' ₽';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчера';
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'short'
      });
    }
  };

  const groupTransactionsByDate = () => {
    const groups = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toDateString();
      if (!groups[date]) {
        groups[date] = {
          date: transaction.date,
          total: 0,
          items: []
        };
      }
      groups[date].items.push(transaction);
      groups[date].total += transaction.amount;
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = () => {
    loadData();
  };

  if (loading && !transactions.length) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      
      <div className={styles.container}>
        {/* Заголовок страницы */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Транзакции</h1>
          <button 
            className={styles.refreshButton}
            onClick={handleRefresh}
            aria-label="Обновить"
            title="Обновить список"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C14.1974 3 16.1979 3.86195 17.6576 5.27737" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 3V7H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Статистика */}
        {stats && (
          <StatsCard
            income={stats.income}
            expense={stats.expense}
            balance={stats.balance}
            period={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        )}

        {/* Фильтры */}
        <DateFilter
          onFilterChange={setFilters}
          selectedPeriod={selectedPeriod}
        />

        {/* Список транзакций */}
        <div className={styles.transactionsList}>
          {groupTransactionsByDate().map((group, index) => (
            <div key={index} className={styles.dateGroup}>
              <div className={styles.dateHeader}>
                <span className={styles.dateLabel}>{formatDate(group.date)}</span>
                <span className={styles.dateTotal}>
                  {formatCurrency(group.total)}
                </span>
              </div>
              
              {group.items.map(transaction => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onCategoryChange={(categoryId) => {
                    transactionService.updateTransactionCategory(transaction.id, categoryId)
                      .then(loadData);
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Плавающая кнопка */}
        <button 
          className={styles.fab}
          onClick={() => console.log('Добавить транзакцию')}
          aria-label="Добавить транзакцию"
          title="Добавить транзакцию"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TransactionsScreen;