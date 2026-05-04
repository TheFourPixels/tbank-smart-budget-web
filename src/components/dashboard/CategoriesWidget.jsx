import React from 'react';
import DonutChart from './charts/DonutChart';
import CategoryBarChart from './charts/CategoryBarChart';

const CategoriesWidget = ({ dashboardData, categorySpending, currentDate }) => {
  if (!dashboardData) return null;

  const { categoryStats } = dashboardData;
  
  // Получаем топ-5 категорий по расходам
  const topCategories = categorySpending
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  return (
    <>
      <h2 className="section-title">Категории</h2>
      <p className="section-desc">
        Тут мы посчитали, в каких категориях<br />Вы потратили больше всего
      </p>

      <div className="cards-row">
        <div className="card donut-card">
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
