import React from 'react';
import './Transactions.css';
import Header from '../Budget/Header/Header';
import Transaction from './Transaction';

const Trasanctions = () => {

  const transactions = [
    { id: 1, title: 'Парковки России', subtitle: 'Транспорт', amount: '50', type: 'negative', icon: '2335_625', date: '2025-02-19' },
    { id: 2, title: 'Мтс', subtitle: 'Связь', amount: '100', type: 'negative', icon: '2335_633', date: '2025-02-19' },
    { id: 3, title: 'Парковки России', subtitle: 'Транспорт', amount: '50', type: 'positive', icon: '2335_664', date: '2025-02-18' },
    { id: 4, title: 'Lamoda', subtitle: 'Одежда', amount: '1500', type: 'negative', icon: '2335_696', date: '2025-02-18' },
    { id: 5, title: 'Кофе', subtitle: 'Еда', amount: '300', type: 'negative', icon: '2335_625', date: '2025-02-17' },
  ];

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

  return (
    <>
      <Header></Header>
      <section id="section-dashboard" className="dashboard">
        <div className="dashboard__container">
          <div className="dashboard__operations">
            <h1 className="operations__title">Операции</h1>

            <div className="operations__search search">
              <img
                src={`${process.env.PUBLIC_URL}/assets/2335_588.svg`}
                alt="Search"
                className="search__icon"
              />
              <input type="text" placeholder="Поиск" className="search__input" />
            </div>

            <div className="operations__filter filter">
              <button className="filter__button">
                <span className="filter__text">Февраль</span>
                <img
                  src={`${process.env.PUBLIC_URL}/assets/2335_603.svg`}
                  alt="Dropdown"
                  className="filter__icon"
                />
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
              <div className="operations__transactions transactions">
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
            </div>
            </div>
          </div>

          <aside className="dashboard__sidebar sidebar">
            <div className="sidebar__card add-card">
              <h2 className="add-card__title">Добавить операцию</h2>
              <div className="add-card__form">
                <div className="add-card__input-group">
                  <div className="add-card__input-wrapper">
                    <input type="text" placeholder="Сумма" className="add-card__input" />
                  </div>
                  <div className="add-card__input-wrapper">
                    <input
                      type="text"
                      placeholder="Название категории"
                      className="add-card__input"
                    />
                  </div>
                </div>
                <button className="add-card__button">Добавить операцию</button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
};

export default Trasanctions;