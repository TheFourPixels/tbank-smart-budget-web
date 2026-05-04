import React from 'react';

const DonutChart = ({ categories }) => {
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const categoryData = categories.map(cat => ({
    ...cat,
    percentage: totalSpent > 0 ? Math.round((cat.spent / totalSpent) * 100) : 0
  }));

  return (
    <div className="donut-content">
      <div className="donut-visualization">
        <div className="donut-chart">
          {categoryData.map((cat, index) => (
            <div 
              key={cat.categoryId}
              className="donut-segment"
              style={{
                '--percentage': cat.percentage,
                '--rotation': index === 0 ? 0 : categoryData.slice(0, index).reduce((sum, c) => sum + c.percentage, 0),
                '--color': cat.color || `hsl(${index * 60}, 70%, 50%)`
              }}
            ></div>
          ))}
        </div>
      </div>
      <div className="donut-legend">
        <div className="legend-items">
          {categoryData.map((cat, index) => (
            <div key={cat.categoryId} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: cat.color || `hsl(${index * 60}, 70%, 50%)` }}
              ></div>
              <span className="legend-label">{cat.categoryName}</span>
              <span className="legend-value">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
