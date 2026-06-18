import React, { useState, useEffect, useCallback } from 'react';
import Header from '../Budget/Header/Header';
import { categoryService } from '../../services/CategoryService';
import { budgetService } from '../../services/BudgetService';
import './Categories.css';
import CategoryCard from './CategoryCard';
import CreateCategory from './CreateCategory';

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // ─── Загрузка ──────────────────────────────────────────────────────────────

  const loadAllCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
        amount: 0,
      }));
    } catch (err) {
      showError('Не удалось загрузить категории');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCurrentBudget = useCallback(async () => {
    try {
      const res = await budgetService.getBudget(currentYear, currentMonth);
      if (res && res.limits) {
        setCurrentBudget(res);
        setBudgetLimits(res.limits || []);
        return res.limits || [];
      }
      setCurrentBudget(null);
      setBudgetLimits([]);
      return [];
    } catch (err) {
      if (err?.status !== 404) {
        showError('Не удалось загрузить бюджет');
      }
      setCurrentBudget(null);
      setBudgetLimits([]);
      return [];
    }
  }, [currentYear, currentMonth]);

  const mergeWithBudget = (cats, limits) =>
    cats.map((cat) => {
      const found = limits.find((l) => l.categoryId === cat.id);
      if (found) {
        return {
          ...cat,
          isInBudget: true,
          limit: found.limitValue || 0,
          limit_type: found.limitType || 'SUM',
          amount: found.limitValue || 0,
        };
      }
      return cat;
    });

  useEffect(() => {
    (async () => {
      const [cats, limits] = await Promise.all([
        loadAllCategories(),
        loadCurrentBudget(),
      ]);
      setCategories(mergeWithBudget(cats, limits));
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Сохранение бюджета ────────────────────────────────────────────────────

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

  // ─── Добавление в бюджет ───────────────────────────────────────────────────

  const handleCategoryClick = async (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (cat?.isInBudget) return;

    setAddingToBudget((prev) => ({ ...prev, [categoryId]: true }));
    try {
      const newLimit = { categoryId, limitValue: 0, limitType: 'SUM' };
      const updated = [...budgetLimits, newLimit];
      await saveBudget(updated);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, isInBudget: true, limit: 0, amount: 0 }
            : c
        )
      );
    } catch {
      showError('Не удалось добавить категорию в бюджет');
    } finally {
      setAddingToBudget((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  // ─── Изменение лимита ──────────────────────────────────────────────────────

  const handleLimitChange = async (categoryId, rawValue) => {
    const limitValue = parseInt(rawValue, 10) || 0;
    const updated = budgetLimits.map((l) =>
      l.categoryId === categoryId ? { ...l, limitValue } : l
    );
    try {
      await saveBudget(updated);
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, limit: limitValue, amount: limitValue } : c
        )
      );
    } catch {
      showError('Не удалось обновить лимит');
    }
  };

  // ─── Создание категории ────────────────────────────────────────────────────

  const handleCreateAndAdd = async ({ name, limitValue, limitType }) => {
    const newCat = await categoryService.createCategory({ name });

    // Добавляем в локальный список немедленно
    const formatted = {
      id: newCat.id,
      name: newCat.name,
      color: '#428bf9',
      isInBudget: limitValue > 0,
      limit: limitValue,
      limit_type: limitType,
      amount: limitValue,
    };
    setCategories((prev) => [formatted, ...prev]);

    // Если указан лимит — добавляем в бюджет
    if (limitValue > 0) {
      const newLimit = { categoryId: newCat.id, limitValue, limitType };
      const updated = [...budgetLimits, newLimit];
      await saveBudget(updated);
    }

    showSuccess(`Категория «${name}» создана`);
  };

  // ─── Удаление категории ────────────────────────────────────────────────────

  const handleDelete = async (categoryId) => {
    try {
      await categoryService.deleteCategory(categoryId);

      // Убираем из бюджета если была там
      const cat = categories.find((c) => c.id === categoryId);
      if (cat?.isInBudget) {
        const updated = budgetLimits.filter((l) => l.categoryId !== categoryId);
        await saveBudget(updated);
      }

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      showSuccess('Категория удалена');
    } catch {
      showError('Не удалось удалить категорию');
    }
  };

  // ─── Фильтрация ────────────────────────────────────────────────────────────

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="page">
      <Header />
      <main className="main">
        <div className="container main__container">
          <h2 className="main__title">Категории</h2>

          {error && (
            <div className="message message--error">
              <span className="message__icon">⚠️</span> {error}
            </div>
          )}
          {successMessage && (
            <div className="message message--success">
              <span className="message__icon">✓</span> {successMessage}
            </div>
          )}

          <section className="available-section">
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
              <div className="categories-grid">
                {filtered.length === 0 ? (
                  <div className="categories-empty">
                    {searchQuery ? 'Ничего не найдено' : 'Нет категорий. Создайте первую ниже.'}
                  </div>
                ) : (
                  filtered.map((category) => (
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onAmountChange={handleLimitChange}
                      onCategoryClick={handleCategoryClick}
                      onDelete={handleDelete}
                      addingToBudget={addingToBudget[category.id]}
                    />
                  ))
                )}
              </div>
            )}

            <CreateCategory onCreateAndAdd={handleCreateAndAdd} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Categories;
