import React from 'react';

const CategoryBarChart = ({ categories, currentDate }) => {
  const maxLimit = Math.max(...categories.map(cat => cat.limit), 0);
  const maxSpent = Math.max(...categories.map(cat => cat.spent), 0);
  const maxValue = Math.max(maxLimit, maxSpent) * 1.1;

  const mainCategory = categories[0] || {};
  const planHeight = maxValue > 0 ? (mainCategory.limit / maxValue) * 100 : 0;
  const factHeight = maxValue > 0 ? (mainCategory.spent / maxValue) * 100 : 0;
  const difference = mainCategory.spent - mainCategory.limit;
  const differencePercent = mainCategory.limit > 0 ? Math.round((difference / mainCategory.limit) * 100) : 0;

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <>
      <div className="cat-bar-header">
        <h3>Траты по категории</h3>
        <span className="cat-tag">{mainCategory.categoryName || 'Категория'}</span>
      </div>
      <div className="cat-summary-row">
        <div className="summary-box plan-light">
          <span className="box-label">План</span>
          <span className="box-value">{(mainCategory.limit || 0).toLocaleString()} Р</span>
        </div>
        <div className="summary-box fact-light">
          <span className="box-label">Факт</span>
          <span className="box-value">{(mainCategory.spent || 0).toLocaleString()} Р</span>
        </div>
      </div>
      <div className="chart-body-flex bar-body cat-bar-body">
        <div className="y-axis">
          <span>{Math.round(maxValue / 1000)}k</span>
          <span>{Math.round(maxValue * 0.75 / 1000)}k</span>
          <span>{Math.round(maxValue * 0.5 / 1000)}k</span>
          <span>0</span>
        </div>
        <div className="chart-plot-area">
          <div className="plot-relative bars-relative">
            <div className="bar-group">
              <div 
                className="bar plan-bar-light" 
                style={{ height: `${planHeight}%` }}
              ></div>
              <div 
                className="bar fact-bar-light" 
                style={{ height: `${factHeight}%` }}
              ></div>
            </div>
            <div 
              className="dashed-line" 
              style={{ bottom: `${planHeight}%` }}
            ></div>
            {differencePercent !== 0 && (
              <div 
                className="custom-tooltip bar-tooltip" 
                style={{ left: '50%', bottom: `${planHeight + 5}%` }}
              >
                <div className="tooltip-text yellow-bg">
                  {differencePercent > 0 ? '+' : ''}{differencePercent}%
                </div>
                <div className="tooltip-icon"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryBarChart;
