import React from 'react';

const BarChart = ({ planAmount, factAmount, differencePercent }) => {
  const maxValue = Math.max(planAmount, factAmount) * 1.2;
  const planHeight = (planAmount / maxValue) * 100;
  const factHeight = (factAmount / maxValue) * 100;

  return (
    <div className="plot-relative bars-relative">
      <div className="bar-group">
        <div 
          className="bar plan-bar" 
          style={{ height: `${planHeight}%` }}
        ></div>
        <div 
          className="bar fact-bar" 
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
  );
};

export default BarChart;
