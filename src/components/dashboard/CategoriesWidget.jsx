import React from 'react';
import DonutChart from './charts/DonutChart';
import CategoryBarChart from './charts/CategoryBarChart';

const CategoriesWidget = ({ dashboardData, categorySpending, currentDate }) => {
  // Добавляем проверки на существование данных
  if (!dashboardData) return null;

  const { categoryStats = [] } = dashboardData;
  
  // Получаем топ-5 категорий по расходам
  const topCategories = (categorySpending || [])
    .sort((a, b) => (b.spent || 0) - (a.spent || 0))
    .slice(0, 5)
    .map((cat, index) => ({
      ...cat,
      color: cat.color || `hsl(${index * 60}, 70%, 50%)`
    }));

  // Проверяем, есть ли данные для отображения
  if (topCategories.length === 0 && categoryStats.length === 0) {
    return (
      <>
        <h2 className="section-title">Категории</h2>
        <p className="section-desc">
          Тут мы посчитали, в каких категориях<br />Вы потратили больше всего
        </p>
        <div className="cards-row">
          <div className="card donut-card">
            <div className="donut-header">
              <h3>Распределение расходов</h3>
              <p className="donut-subtitle">Нет данных для отображения</p>
            </div>
          </div>
          <div className="card category-bar-card">
            <div className="cat-bar-header">
              <h3>Траты по категории</h3>
              <p>Нет данных для отображения</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="section-title">Категории</h2>
      <p className="section-desc">
        Тут мы посчитали, в каких категориях<br />Вы потратили больше всего
      </p>

      <div className="cards-row">
        <div className="card donut-card">
          <div className="donut-header">
            <h3>Распределение расходов</h3>
            <p className="donut-subtitle">Топ-5 категорий</p>
          </div>
          <DonutChart categories={topCategories} />
        </div>

        <div className="card category-bar-card">
          <CategoryBarChart 
            categories={categoryStats}
            currentDate={currentDate}
          />
        </div>
      </div>
    </>
  );
};

export default CategoriesWidget;
