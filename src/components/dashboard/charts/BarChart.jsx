// BarChart.js
import React from 'react';

const BarChart = ({ planAmount, factAmount, differencePercent }) => {
  const maxValue = Math.max(planAmount, factAmount) * 1.2 || 1000; // Защита от деления на 0
  const chartHeight = 188;
  
  const planHeight = (planAmount / maxValue) * chartHeight;
  const factHeight = (factAmount / maxValue) * chartHeight;

  return (
    <div className="plot-relative bars-relative" style={{ height: `${chartHeight}px`, position: 'relative' }}>
      <div className="bar-group" style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'center', 
          height: '100%', 
          gap: '40px' 
      }}>
        {/* План */}
        <div className="bar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            className="bar plan-bar" 
            style={{ 
                height: `${planHeight}px`, 
                width: '60px',
                borderRadius: '8px 8px 0 0',
                transition: 'height 0.5s ease'
            }}
          />
          <span className="bar-label" style={{ marginTop: '8px', fontSize: '12px', color: '#555' }}>План</span>
        </div>

        {/* Факт */}
        <div className="bar-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            className="bar fact-bar" 
            style={{ 
                height: `${factHeight}px`, 
                width: '60px',
                borderRadius: '8px 8px 0 0',
                transition: 'height 0.5s ease'
            }}
          />
          <span className="bar-label" style={{ marginTop: '8px', fontSize: '12px', color: '#555' }}>Факт</span>
        </div>
      </div>
      
      {/* Пунктирная линия уровня плана */}
      <div
        className="dashed-line"
        style={{ 
            position: 'absolute', 
            width: '100%', 
            borderTop: '1px dashed #ccc', 
            bottom: `${planHeight}px`,
            pointerEvents: 'none'
        }}
      />
      
      {/* Тултип с разницей */}
      {differencePercent !== 0 && (
        <div 
          className="custom-tooltip bar-tooltip" 
          style={{ 
            position: 'absolute',
            left: '65%', // Чуть правее центра, чтобы не перекрывать план
            bottom: `${Math.max(planHeight, factHeight) + 10}px`,
            transform: 'translateX(-50%)',
            zIndex: 10
          }}
        >
          <div className="tooltip-text yellow-bg" style={{
              backgroundColor: differencePercent > 0 ? '#ffdd2d' : '#4CAF50',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#333',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}>
            {differencePercent > 0 ? '+' : ''}{differencePercent}%
          </div>
        </div>
      )}
    </div>
  );
};

export default BarChart;
