import React, { useState, useMemo } from 'react';
import './CategoriesGrid.css';

const CategoriesGrid = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const [categories] = useState([
    { id: 1, name: 'Транспорт', twoLines: false, isInBudget: true, limit: 15000, limit_type: 'ABSOLUTE' },
    { id: 2, name: 'Музыкальные инструменты', twoLines: true, isInBudget: true, limit: 30000, limit_type: 'ABSOLUTE' },
    { id: 3, name: 'Продукты', twoLines: false, isInBudget: true, limit: 20000, limit_type: 'ABSOLUTE' },
    { id: 4, name: 'Рестораны', twoLines: false, isInBudget: true, limit: 12000, limit_type: 'ABSOLUTE' },
    { id: 5, name: 'Развлечения', twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
    { id: 6, name: 'Одежда', twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
    { id: 7, name: 'Здоровье', twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
    { id: 8, name: 'Образование', twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
    { id: 9, name: 'Путешествия', twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
    { id: 10, name: 'Коммунальные услуги', twoLines: true, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
    { id: 11, name: 'Техника', twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
    { id: 12, name: 'Подарки', twoLines: false, isInBudget: false, limit: 0, limit_type: 'ABSOLUTE' },
  ]);

  const budgetCategories = useMemo(
    () => categories.filter((c) => c.isInBudget),
    [categories]
  );

  const filteredBudgetCategories = useMemo(
    () =>
      budgetCategories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, budgetCategories]
  );

  const getSpentAmount = () => 12300;
  const formatCurrency = (amount) => `${amount.toLocaleString('ru-RU')} ₽`;

  return (
          <section className="stats-section">
            <div className="stats-grid">
              {filteredBudgetCategories.length === 0 ? (
                <div className="stats-empty">
                  {searchQuery
                    ? 'Нет категорий, соответствующих поиску'
                    : 'Добавьте категории в бюджет, чтобы увидеть статистику'}
                </div>
              ) : (
                filteredBudgetCategories.map((category) => {
                  const spent = getSpentAmount();
                  const limit = category.limit;
                  const free = Math.max(limit - spent, 0);
                  const progressPercent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

                  return (
                    <div key={category.id} className="stat-card">
                      <div className="card-header">
                        <div className="card-icon">
                          <div className="icon-placeholder">
                            {category.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <span className="card-title">{category.name}</span>
                      </div>

                      <div className="progress-bar-container">
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="stat-rows">
                        <div className="stat-row">
                          <span className="stat-label">Потрачено</span>
                          <div className="stat-value-group-free">
                            <span className="stat-value">{formatCurrency(spent)}</span>
                          </div>
                        </div>

                        <div className="stat-row">
                          <span className="stat-label">Лимит расходов</span>
                          <div className="stat-value-group">
                            <span className="stat-value">{formatCurrency(limit)}</span>
                          </div>
                        </div>

                        <div className="stat-row">
                          <span className="stat-label">Свободные средства</span>
                          <div className="stat-value-group-free">
                            <span className="stat-value">{formatCurrency(free)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
  );
};

export default CategoriesGrid;