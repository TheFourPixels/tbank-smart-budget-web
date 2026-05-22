// Исправленный AreaChart.js
import React from 'react';

const AreaChart = ({ planAmount, factAmount, differencePercent, dailySpending = [] }) => {
  // Используем реальные данные или генерируем примерные данные
  const chartData = dailySpending.length > 0 ? dailySpending : 
    Array.from({ length: 31 }, (_, i) => ({
      day: i + 1,
      amount: Math.random() * (factAmount / 31) * 2
    }));

  const maxValue = Math.max(...chartData.map(d => d.amount), planAmount, factAmount) * 1.2;
  
  return (
    <div className="plot-relative">
      <div className="area-chart-visualization">
        <svg width="100%" height="100%" viewBox="0 0 382 200">
          {/* Линия плана */}
          <line 
            x1="0" 
            y1={200 - (planAmount / maxValue) * 200} 
            x2="382" 
            y2={200 - (planAmount / maxValue) * 200} 
            stroke="#554e95" 
            strokeWidth="1" 
            strokeDasharray="5,5"
          />
          
          {/* Область фактических трат */}
          <path 
            d={`M 0 200 ${chartData.map((d, i) => 
              `L ${(i / (chartData.length - 1)) * 382} ${200 - (d.amount / maxValue) * 200}`
            ).join(' ')} L 382 200 Z`}
            fill="url(#areaGradient)"
            opacity="0.7"
          />
          
          {/* Линия фактических трат */}
          <path 
            d={`M 0 ${200 - (chartData[0]?.amount / maxValue) * 200} ${chartData.map((d, i) => 
              `L ${(i / (chartData.length - 1)) * 382} ${200 - (d.amount / maxValue) * 200}`
            ).join(' ')}`}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="2"
          />
          
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ecdc4" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#4ecdc4" stopOpacity="0.2"/>
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b6b"/>
              <stop offset="100%" stopColor="#4ecdc4"/>
            </linearGradient>
          </defs>
        </svg>
        
        {differencePercent > 0 && (
          <div className="custom-tooltip" style={{ left: '70%', top: '30%' }}>
            <div className="tooltip-text yellow-bg">Превышение</div>
            <div className="tooltip-dot"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaChart;
