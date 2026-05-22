// Исправленный BarChart.js
import React from 'react';

const BarChart = ({ planAmount, factAmount, differencePercent }) => {
  const maxValue = Math.max(planAmount, factAmount) * 1.2;
  const planHeight = maxValue > 0 ? (planAmount / maxValue) * 188 : 0;
  const factHeight = maxValue > 0 ? (factAmount / maxValue) * 188 : 0;

  return (
    <div className="plot-relative bars-relative">
      <div className="bar-group">
        <div className="bar-container">
          <div 
            className="bar plan-bar" 
            style={{ height: `${planHeight}px` }}
          >
            <span className="bar-label">{planAmount.toLocaleString()}</span>
          </div>
        </div>
        <div className="bar-container">
          <div 
            className="bar fact-bar" 
            style={{ height: `${factHeight}px` }}
          >
            <span className="bar-label">{factAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div 
        className="dashed-line" 
        style={{ bottom: `${(planAmount / maxValue) * 188}px` }}
      ></div>
      
      {differencePercent !== 0 && (
        <div 
          className="custom-tooltip bar-tooltip" 
          style={{ 
            left: '50%', 
            bottom: `${(planAmount / maxValue) * 188 + 20}px` 
          }}
        >
          <div className="tooltip-text yellow-bg">
            {differencePercent > 0 ? '+' : ''}{differencePercent}%
          </div>
          <div className="tooltip-icon"></div>
        </div>
      )}
      
      <style jsx>{`
        .bar-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .bar-label {
          margin-top: 5px;
          font-size: 12px;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default BarChart;
