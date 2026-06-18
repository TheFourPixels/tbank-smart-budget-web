import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Budget/Header/Header';
import { categoryService } from '../../services/CategoryService';
import { budgetService } from '../../services/BudgetService';
import './CategoriesPage.css';
import CategoriesGrid from './CategoriesGrid';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgetLimits, setBudgetLimits] = useState([]);
  const [addingToBudget, setAddingToBudget] = useState({});

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 4000);
  };

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const mergeWithBudget = (cats, limits) =>
    cats.map((cat) => {
      const found = limits.find((l) => l.categoryId === cat.id);
      return found
        ? { ...cat, isInBudget: true, limit: found.limitValue || 0, limit_type: found.limitType || 'SUM' }
        : cat;
    });

  // ─── Load ─────────────────────────────────────────────────────────────────────

  const loadAllCategories = useCallback(async () => {
    let all = [];
    let page = 0;
    let totalPages = 1;
    while (page < totalPages) {
      const res = await categoryService.getCategories({ page, size: 50 });
      all = [...all, ...(res.content || [])];
      totalPages = res.totalPages || 1;
      page++;
    }
    return all.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: '#428bf9',
      isInBudget: false,
      limit: 0,
      limit_type: 'SUM',
      spent: 0,
    }));
  }, []);

  const loadCurrentBudget = useCallback(async () => {
    try {
      const res = await budgetService.getBudget(currentYear, currentMonth);
      if (res?.limits) {
        setCurrentBudget(res);
        const limits = res.limits || [];
        setBudgetLimits(limits);
        return limits;
      }
    } catch (err) {
      if (err?.status !== 404) showError('Не удалось загрузить бюджет');
    }
    setCurrentBudget(null);
    setBudgetLimits([]);
    return [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear, currentMonth]);

  // Загружаем spent для всех категорий в бюджете параллельно
  const loadCategoryStats = useCallback(async (cats) => {
    const inBudget = cats.filter((c) => c.isInBudget);
    if (inBudget.length === 0) return cats;

    const results = await Promise.allSettled(
      inBudget.map((cat) =>
        categoryService.getCategoryStats(cat.id, currentYear, currentMonth)
      )
    );

    const spentMap = {};
    inBudget.forEach((cat, i) => {
      const result = results[i];
      if (result.status === 'fulfilled' && result.value) {
        // API может вернуть totalAmount, spent, или другое поле — берём что есть
        spentMap[cat.id] =
          result.value.totalAmount ??
          result.value.spent ??
          result.value.amount ??
          0;
      }
    });

    return cats.map((cat) =>
      spentMap[cat.id] !== undefined
        ? { ...cat, spent: spentMap[cat.id] }
        : cat
    );
  }, [currentYear, currentMonth]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [cats, limits] = await Promise.all([
          loadAllCategories(),
          loadCurrentBudget(),
        ]);
        const merged = mergeWithBudget(cats, limits);
        const withStats = await loadCategoryStats(merged);
        setCategories(withStats);
      } catch {
        showError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Save budget ──────────────────────────────────────────────────────────────

  const saveBudget = async (updatedLimits) => {
    const data = {
      year: currentYear,
      month: currentMonth,
      totalIncome: currentBudget?.totalIncome || 0,
      limits: updatedLimits,
    };
    const res = await budgetService.createOrUpdateBudget(data);
    setCurrentBudget(res);
    const newLimits = res.limits || [];
    setBudgetLimits(newLimits);
    return newLimits;
  };

  // ─── Add to budget ────────────────────────────────────────────────────────────

  const handleCategoryClick = async (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat?.isInBudget) return;

    setAddingToBudget((prev) => ({ ...prev, [categoryId]: true }));
    try {
      const newLimit = { categoryId, limitValue: 0, limitType: 'SUM' };
      await saveBudget([...budgetLimits, newLimit]);

      // Сразу подгружаем статистику для новой категории
      let spent = 0;
      try {
        const stats = await categoryService.getCategoryStats(categoryId, currentYear, currentMonth);
        spent = stats?.totalAmount ?? stats?.spent ?? stats?.amount ?? 0;
      } catch { /* не критично */ }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, isInBudget: true, limit: 0, spent } : c
        )
      );
    } catch {
      showError('Не удалось добавить категорию в бюджет');
    } finally {
      setAddingToBudget((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  // ─── Change limit ─────────────────────────────────────────────────────────────

  const handleLimitChange = async (categoryId, rawValue) => {
    const limitValue = parseInt(rawValue, 10) || 0;
    const updated = budgetLimits.map((l) =>
      l.categoryId === categoryId ? { ...l, limitValue } : l
    );
    try {
      await saveBudget(updated);
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, limit: limitValue } : c))
      );
    } catch {
      showError('Не удалось обновить лимит');
    }
  };

  // ─── Derived ──────────────────────────────────────────────────────────────────

  const budgetCategories = useMemo(
    () => categories.filter((c) => c.isInBudget),
    [categories]
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="container main__container">
          <h2 className="main__title">Категории вашего бюджета</h2>

          {error && (
            <div className="message message--error">
              <span className="message__icon">⚠️</span> {error}
            </div>
          )}

          {/* Выбранные категории */}
          <section className="categories-section">
            <div className="categories-card">
              <div className="categories-card__content">
                <span className="categories-card__label">Выбранные категории</span>
                <div className="categories-icons">
                  {budgetCategories.length === 0 ? (
                    <span className="categories-empty">Нет выбранных категорий</span>
                  ) : (
                    budgetCategories.map((cat) => (
                      <div key={cat.id} className="icon" title={cat.name}>
                        <div className="icon__placeholder">
                          {cat.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <button
                  className="button button--primary categories-card__button"
                  onClick={() => navigate('/categories/create')}
                >
                  Добавить категорию
                </button>
              </div>
            </div>
          </section>

          {/* Статистика */}
          <section className="available-section">
            <h2 className="stat-title">Статистика по категориям</h2>

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
                  <button className="search__clear" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="loading">
                <div className="loading__spinner" />
                <span>Загрузка...</span>
              </div>
            ) : (
              <CategoriesGrid
                categories={categories}
                searchQuery={searchQuery}
                onLimitChange={handleLimitChange}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default CategoriesPage;
