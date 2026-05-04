import React from 'react';

const AreaChart = ({ planAmount, factAmount, differencePercent }) => {
  // Простая визуализация графика
  const maxAmount = Math.max(planAmount, factAmount) * 1.2;
  const planHeight = (planAmount / maxAmount) * 100;
  const factHeight = (factAmount / maxAmount) * 100;

  return (
    <div className="plot-relative">
      <div className="area-chart-visualization">
        <div className="area-line-placeholder">
          {/* Визуализация линии графика */}
          <div className="chart-line" style={{ height: `${factHeight}%` }}></div>
        </div>
        {differencePercent > 0 && (
          <div className="custom-tooltip" style={{ left: '35%', top: '20%' }}>
            <div className="tooltip-text yellow-bg">Превышение</div>
            <div className="tooltip-dot"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaChart;
