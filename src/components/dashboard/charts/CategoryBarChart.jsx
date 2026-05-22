// CategoryBarChart.js
import React from 'react';

const CategoryBarChart = ({ categories, currentDate }) => {
  const mainCategory = categories[0] || {};
  const maxValue = Math.max(
    mainCategory.limit || 0,
    mainCategory.spent || 0,
    ...categories.map(c => Math.max(c.limit, c.spent)),
    1 // чтобы не было деления на ноль
  );

  const planHeight = Math.min((mainCategory.limit / maxValue) * 100, 100);
  const factHeight = Math.min((mainCategory.spent / maxValue) * 100, 100);
  const difference = mainCategory.spent - mainCategory.limit;
  const diffPercent = mainCategory.limit > 0
    ? Math.round((difference / mainCategory.limit) * 100)
    : mainCategory.spent > 0 ? 100 : 0;

  const monthName = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ][currentDate.getMonth()];

  const yLabels = [maxValue, maxValue * 0.75, maxValue * 0.5, 0].map(v =>
    v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)
  );

  return (
    <>
      <div className="cat-bar-header">
        <h3>Траты по категории</h3>
        <span className="cat-tag">{mainCategory.categoryName || 'Категория'}</span>
      </div>
      <div className="cat-summary-row">
        <div className="summary-box plan-light">
          <span className="box-label">План</span>
          <span className="box-value">{(mainCategory.limit || 0).toLocaleString()} ₽</span>
        </div>
        <div className="summary-box fact-light">
          <span className="box-label">Факт</span>
          <span className="box-value">{(mainCategory.spent || 0).toLocaleString()} ₽</span>
        </div>
      </div>
      <div className="chart-body-flex bar-body cat-bar-body">
        <div className="y-axis">
          {yLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="chart-plot-area">
          <div className="plot-relative bars-relative">
            <div className="bar-group">
              <div
                className="bar plan-bar-light"
                style={{ height: `${planHeight}%`, minHeight: planHeight > 0 ? '4px' : 0 }}
              />
              <div
                className="bar fact-bar-light"
                style={{ height: `${factHeight}%`, minHeight: factHeight > 0 ? '4px' : 0 }}
              />
            </div>
            {/* Пунктирная линия на уровне плана */}
            <div
              className="dashed-line"
              style={{ bottom: `${planHeight}%` }}
            />
            {diffPercent !== 0 && (
              <div
                className="custom-tooltip bar-tooltip"
                style={{
                  left: '50%',
                  bottom: `${Math.min(planHeight + 3, 95)}%` // не вылезаем за границы
                }}
              >
                <div className="tooltip-text yellow-bg">
                  {diffPercent > 0 ? '+' : ''}{diffPercent}%
                </div>
                <div className="tooltip-icon" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryBarChart;