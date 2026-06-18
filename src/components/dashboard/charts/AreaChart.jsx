// AreaChart.js
import React, { useMemo } from 'react';

const AreaChart = ({ planAmount, factAmount, differencePercent, dailySpending = [] }) => {
  // Если детальные данные по дням не переданы, строим равномерный
  // накопительный график от 0 до фактической суммы трат.
  // Раньше здесь использовался Math.random(), из-за чего график
  // перерисовывался по-разному при каждом рендере и показывал
  // случайные, а не реальные цифры.
  const chartData = useMemo(() => {
    if (dailySpending.length > 0) return dailySpending;

    const days = 31;
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      amount: (factAmount / days) * (i + 1),
    }));
  }, [dailySpending, factAmount]);

  const width = 382;
  const height = 200;
  const padding = 20;

  const maxValue = Math.max(...chartData.map(d => d.amount), planAmount, 1) * 1.1;

  // Функция масштабирования
  const getX = (index) => {
    if (chartData.length <= 1) return padding;
    return (index / (chartData.length - 1)) * (width - padding * 2) + padding;
  };
  const getY = (value) => height - padding - (value / maxValue) * (height - padding * 2);

  // Построение пути для области (Area)
  const areaPath = `
    M ${padding} ${height - padding}
    ${chartData.map((d, i) => `L ${getX(i)} ${getY(d.amount)}`).join(' ')}
    L ${width - padding} ${height - padding}
    Z
  `;

  // Построение пути для линии (Line)
  const linePath = `
    M ${getX(0)} ${getY(chartData[0].amount)}
    ${chartData.map((d, i) => `L ${getX(i)} ${getY(d.amount)}`).join(' ')}
  `;

  // Позиция тултипа (берем последнюю точку)
  const lastPoint = chartData[chartData.length - 1];
  const tooltipX = getX(chartData.length - 1);
  const tooltipY = getY(lastPoint.amount);

  return (
    <div className="plot-relative" style={{ width: '100%', height: '100%' }}>
      <div className="area-chart-visualization" style={{ width: '100%', height: '100%', position: 'relative' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4ecdc4" stopOpacity="0.4"/>
              <stop offset="100%" stopColor="#4ecdc4" stopOpacity="0.05"/>
            </linearGradient>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b6b"/>
              <stop offset="100%" stopColor="#4ecdc4"/>
            </linearGradient>
          </defs>
          
          {/* Линия плана (горизонтальная) */}
          <line 
            x1={padding} 
            y1={getY(planAmount)} 
            x2={width - padding} 
            y2={getY(planAmount)} 
            stroke="#554e95" 
            strokeWidth="2" 
            strokeDasharray="6,4"
            opacity="0.5"
          />
          
          {/* Область фактических трат */}
          <path d={areaPath} fill="url(#areaGradient)" />
          
          {/* Линия фактических трат */}
          <path 
            d={linePath}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Точка на конце графика */}
          <circle 
            cx={tooltipX} 
            cy={tooltipY} 
            r="5" 
            fill="#fff" 
            stroke="#4ecdc4" 
            strokeWidth="3" 
          />
        </svg>
        
        {/* Динамический тултип */}
        {differencePercent > 0 && (
          <div className="custom-tooltip" style={{ 
              position: 'absolute', 
              left: `${(tooltipX / width) * 100}%`, 
              top: `${(tooltipY / height) * 100}%`,
              transform: 'translate(-50%, -120%)', // Сдвигаем вверх над точкой
              zIndex: 10
          }}>
            <div className="tooltip-text yellow-bg" style={{
                backgroundColor: '#fff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#d32f2f',
                boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                border: '1px solid #ffcdd2'
            }}>
              Превышение {differencePercent}%
            </div>
            <div style={{
                width: 0, 
                height: 0, 
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #fff',
                margin: '0 auto',
                position: 'relative',
                top: '-1px'
            }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaChart;
