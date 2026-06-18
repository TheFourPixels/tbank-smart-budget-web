import React, { useState } from 'react';
import styles from './CreateCategory.module.css';

const CreateCategory = ({ onCreateAndAdd }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryLimit, setCategoryLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formatNumber = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const handleLimitChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    setCategoryLimit(raw);
  };

  const handleCreate = async () => {
    const name = categoryName.trim();
    if (!name) {
      setError('Введите название категории');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const limitValue = parseInt(categoryLimit, 10) || 0;
      await onCreateAndAdd({
        name,
        limitValue,
        limitType: 'SUM',
      });
      setCategoryName('');
      setCategoryLimit('');
    } catch (err) {
      setError('Не удалось создать категорию');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate();
  };

  return (
    <section className={styles.section}>
      <div className={styles.form}>
        <h2 className={styles.title}>Создание категории</h2>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label}>Название категории</label>
            <input
              type="text"
              className={styles.input}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите название"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Лимит категории (₽)</label>
            <div className={styles.limitField}>
              <input
                type="text"
                className={styles.limitInput}
                value={formatNumber(categoryLimit)}
                onChange={handleLimitChange}
                onKeyDown={handleKeyDown}
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        <div className={styles.submit}>
          <button
            className={styles.button}
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Создание...' : 'Создать категорию'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default CreateCategory;
