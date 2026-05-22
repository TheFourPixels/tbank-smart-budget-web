import React, { useState } from 'react';
import styles from './CreateCategory.module.css';

const CreateCategory = ({ onCreateCategory, onAddToBudget }) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryLimit, setCategoryLimit] = useState('');
  const [addToBudget, setAddToBudget] = useState(false);

  const formatNumber = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const handleLimitChange = (e) => {
    const rawValue = e.target.value.replace(/[^\d]/g, '');
    setCategoryLimit(rawValue);
  };

  const handleCreate = async () => {
    if (!categoryName.trim()) {
      alert('Введите название категории');
      return;
    }
    
    const limitValue = parseInt(categoryLimit, 10) || 0;

    try {
      const newCategory = await onCreateCategory({
        name: categoryName.trim(),
      });

      if (addToBudget && newCategory && newCategory.id) {
        await onAddToBudget({
          categoryId: newCategory.id,
          limitValue: limitValue,
          limitType: 'SUM'
        });
      }

      setCategoryName('');
      setCategoryLimit('');
      setAddToBudget(false);
      
    } catch (error) {
      console.error('Ошибка при создании категории:', error);
      alert('Не удалось создать категорию');
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.overlay}></div>
      <div className={styles.container}>
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
                placeholder="Введите название"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Лимит категории</label>
              <div className={styles.limitField}>
                <input
                  type="text"
                  className={styles.limitInput}
                  value={formatNumber(categoryLimit)}
                  onChange={handleLimitChange}
                  onBlur={() => {
                    if (!categoryLimit) setCategoryLimit('');
                  }}
                  placeholder="0"
                />
              </div>
            </div>

        
          </div>

          <div className={styles.submit}>
            <button className={styles.button} type="button" onClick={handleCreate}>
              Создать категорию
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateCategory;
