import React, { useMemo, useState } from 'react';
import './CategoriesGrid.css';

const formatCurrency = (amount) =>
  `${Number(amount).toLocaleString('ru-RU')} ₽`;

const CategoriesGrid = ({ categories = [], onLimitChange, searchQuery = '' }) => {
  const [editingId, setEditingId] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const budgetCategories = useMemo(
    () =>
      categories
        .filter((c) => c.isInBudget)
        .filter((c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    [categories, searchQuery]
  );

  const handleLimitClick = (cat) => {
    setEditingId(cat.id);
    setInputValue(cat.limit > 0 ? String(cat.limit) : '');
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value.replace(/[^\d]/g, ''));
  };

  const handleInputBlur = (categoryId) => {
    const val = parseInt(inputValue, 10) || 0;
    if (onLimitChange) onLimitChange(categoryId, String(val));
    setEditingId(null);
  };

  const handleKeyDown = (e, categoryId) => {
    if (e.key === 'Enter') handleInputBlur(categoryId);
    if (e.key === 'Escape') setEditingId(null);
  };

  if (budgetCategories.length === 0) {
    return (
      <section className="stats-section">
        <div className="stats-empty">
          {searchQuery
            ? 'Нет категорий, соответствующих поиску'
            : 'Добавьте категории в бюджет, чтобы увидеть статистику'}
        </div>
      </section>
    );
  }

  return (
    <section className="stats-section">
      <div className="stats-grid">
        {budgetCategories.map((category) => {
          const spent = category.spent || 0;
          const limit = category.limit || 0;
          const free = Math.max(limit - spent, 0);
          const progressPercent =
            limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
          const isOver = spent > limit && limit > 0;

          return (
            <div key={category.id} className="stat-card">
              <div className="card-header">
                <div className="card-icon">
                  <div
                    className="icon-placeholder"
                    style={{ backgroundColor: category.color || '#428bf9' }}
                  >
                    {category.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <span className="card-title">{category.name}</span>
              </div>

              <div className="progress-bar-container">
                <div className="progress-track">
                  <div
                    className={`progress-fill ${isOver ? 'progress-fill--over' : ''}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="progress-percent">
                  {Math.round(progressPercent)}%
                </span>
              </div>

              <div className="stat-rows">
                <div className="stat-row">
                  <span className="stat-label">Потрачено</span>
                  <span className={`stat-value ${isOver ? 'stat-value--over' : ''}`}>
                    {formatCurrency(spent)}
                  </span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Лимит расходов</span>
                  {editingId === category.id ? (
                    <input
                      className="stat-limit-input"
                      autoFocus
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={() => handleInputBlur(category.id)}
                      onKeyDown={(e) => handleKeyDown(e, category.id)}
                      placeholder="0"
                    />
                  ) : (
                    <button
                      className="stat-value stat-value--editable"
                      onClick={() => handleLimitClick(category)}
                      title="Нажмите, чтобы изменить лимит"
                    >
                      {formatCurrency(limit)}
                      <span className="edit-icon">✎</span>
                    </button>
                  )}
                </div>

                <div className="stat-row">
                  <span className="stat-label">Свободные средства</span>
                  <span className="stat-value stat-value--free">
                    {formatCurrency(free)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesGrid;
