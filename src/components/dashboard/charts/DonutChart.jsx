// DonutChart.js
import React from 'react';

const DonutChart = ({ categories }) => {
  // Проверка на пустые данные вынесена НАВЕРХ
  if (!categories || categories.length === 0) {
    return (
      <div className="donut-content" style={{ justifyContent: 'center', alignItems: 'center', height: '184px' }}>
        <p style={{ color: '#999', fontStyle: 'italic', margin: 0, textAlign: 'center' }}>
          Нет данных о расходах
        </p>
      </div>
    );
  }

  const totalSpent = categories.reduce((sum, cat) => sum + (cat.spent || 0), 0);

  if (totalSpent === 0) {
     return (
      <div className="donut-content" style={{ justifyContent: 'center', alignItems: 'center', height: '184px' }}>
        <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>Расходов не зафиксировано</p>
      </div>
    );
  }

  const radius = 70;
  const strokeWidth = 25;
  const circumference = 2 * Math.PI * radius;
  const center = radius + strokeWidth; // Чуть больше для отступа

  let cumulativePercent = 0;

  const segments = categories.map((cat, index) => {
    const percent = cat.spent / totalSpent;
    const dashLength = circumference * percent;
    const rotation = cumulativePercent * 360;
    cumulativePercent += percent;

    return {
      ...cat,
      dashArray: `${dashLength} ${circumference}`, // Важно: второй параметр - полная длина круга
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
              key={seg.categoryId || seg.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dashArray}
              // strokeDashoffset сдвигает начало сегмента. 
              // Мы используем transform rotate для позиционирования начала
              transform={`rotate(-90 ${center} ${center}) rotate(${seg.rotation} ${center} ${center})`}
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
              strokeLinecap="round" // Скругленные края сегментов
            />
          ))}
          {/* Центральный круг (для эффекта пончика, если нужно перекрыть центр) */}
          <circle 
            cx={center} 
            cy={center} 
            r={radius - strokeWidth} 
            fill="#ffffff" 
          />
        </svg>
        {/* Опционально: Общая сумма в центре */}
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
        }}>
            <span style={{fontSize: '14px', color: '#333', fontWeight: 'bold'}}>
                {Math.round(totalSpent).toLocaleString()} ₽
            </span>
        </div>
      </div>
      <div className="donut-legend">
        <div className="legend-items">
          {segments.map((cat) => (
            <div key={cat.categoryId || cat.name} className="legend-item">
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
