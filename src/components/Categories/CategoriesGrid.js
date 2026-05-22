import React, { useState, useMemo } from 'react';
import './CategoriesGrid.css';

const CategoriesGrid = ({ categories = [], onLimitChange, searchQuery = '' }) => {
  const [localSearchQuery, setSearchQuery] = useState(searchQuery);

  const budgetCategories = useMemo(
    () => categories.filter((c) => c.isInBudget),
    [categories]
  );

  const filteredBudgetCategories = useMemo(
    () =>
      budgetCategories.filter((cat) =>
        cat.name.toLowerCase().includes((localSearchQuery || searchQuery || '').toLowerCase())
      ),
    [localSearchQuery, searchQuery, budgetCategories]
  );

  const getSpentAmount = () => 0;
  const formatCurrency = (amount) => `${amount.toLocaleString('ru-RU')} ₽`;

  return (
    <section className="stats-section">
      <div className="stats-grid">
        {filteredBudgetCategories.length === 0 ? (
          <div className="stats-empty">
            {searchQuery || localSearchQuery
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
