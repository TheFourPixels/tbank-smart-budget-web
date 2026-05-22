// DonutChart.js
import React from 'react';

const DonutChart = ({ categories }) => {
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  const radius = 70;         // радиус кольца
  const strokeWidth = 25;    // толщина
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth / 2; // центр viewBox

  let cumulativePercent = 0;

  const segments = categories.map((cat, index) => {
    const percent = totalSpent > 0 ? cat.spent / totalSpent : 0;
    const dashLength = circumference * percent;
    const gapLength = circumference - dashLength;
    const rotation = cumulativePercent * 360;
    cumulativePercent += percent;

    if (!categories || categories.length === 0 || totalSpent === 0) {
    return (
      <div className="donut-content" style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>Информации нет</p>
      </div>
    );
  }

    return {
      ...cat,
      dashArray: `${dashLength} ${gapLength}`,
      rotation,
      color: cat.color || `hsl(${index * 60}, 70%, 50%)`,
      percent: Math.round(percent * 100)
    };
  });

  

  return (
    <div className="donut-content">
      <div className="donut-visualization">
        <svg viewBox={`0 0 ${center * 2} ${center * 2}`} className="donut-chart">
          {segments.map((seg) => (
            <circle
              key={seg.categoryId}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={0}
              transform={`rotate(${seg.rotation} ${center} ${center})`}
              style={{ transition: 'stroke-dasharray 0.3s' }}
            />
          ))}
        </svg>
      </div>
      <div className="donut-legend">
        <div className="legend-items">
          {segments.map((cat) => (
            <div key={cat.categoryId} className="legend-item">
              <div
                className="legend-color"
                style={{ backgroundColor: cat.color }}
              />
              <span className="legend-label">{cat.categoryName}</span>
              <span className="legend-value">{cat.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;