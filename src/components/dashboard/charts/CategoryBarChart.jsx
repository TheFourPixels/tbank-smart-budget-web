// CategoryBarChart.js
import React from 'react';

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-state-icon">
      <svg viewBox="0 0 100 100" width="80" height="80">
        {/* Фон круга */}
        <circle cx="50" cy="50" r="45" fill="#f5f7fa" stroke="#e0e6ed" strokeWidth="2"/>
        
        {/* График */}
        <path d="M 20 70 L 35 55 L 50 65 L 65 40 L 80 50" 
              fill="none" 
              stroke="#c5d0e0" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"/>
        
        {/* Точки на графике */}
        <circle cx="20" cy="70" r="4" fill="#a0aec0"/>
        <circle cx="35" cy="55" r="4" fill="#a0aec0"/>
        <circle cx="50" cy="65" r="4" fill="#a0aec0"/>
        <circle cx="65" cy="40" r="4" fill="#a0aec0"/>
        <circle cx="80" cy="50" r="4" fill="#a0aec0"/>
        
        {/* Декоративные элементы */}
        <circle cx="50" cy="25" r="8" fill="#e2e8f0"/>
        <path d="M 45 25 L 50 20 L 55 25" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round"/>
        <line x1="50" y1="25" x2="50" y2="30" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
    <h4 className="empty-state-title">Нет данных о категории</h4>
    <p className="empty-state-desc">
      Расходы по категориям появятся здесь,<br/>как только вы начнёте их добавлять
    </p>
    <div className="empty-state-hint">
      <span className="hint-dot"></span>
      <span className="hint-dot"></span>
      <span className="hint-dot"></span>
    </div>
  </div>
);

const CategoryBarChart = ({ categories, currentDate }) => {
  const mainCategory = categories && categories.length > 0 ? categories[0] : {};
  
  const limit = mainCategory.limit || 0;
  const spent = mainCategory.spent || 0;
  
  const maxValue = Math.max(limit, spent, 1000);
  const chartHeight = 188;

  const planHeight = (limit / maxValue) * chartHeight;
  const factHeight = (spent / maxValue) * chartHeight;
  
  const difference = spent - limit;
  const diffPercent = limit > 0 ? Math.round((difference / limit) * 100) : (spent > 0 ? 100 : 0);

  const yLabels = [maxValue, maxValue * 0.5, 0].map(v =>
    v >= 1000 ? `${Math.round(v / 1000)}k` : Math.round(v)
  );

  if (!mainCategory.name || categories.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <div className="cat-bar-header">
        <h3>Траты по категории</h3>
        <span className="cat-tag">{mainCategory.name}</span>
      </div>
      
      <div className="cat-summary-row" style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center', marginBottom: '20px' }}>
        <div className="summary-box plan-light" style={{ backgroundColor: '#e3f2fd', color: '#1976d2', padding: '10px 20px', borderRadius: '12px', textAlign: 'center', flex: 1 }}>
          <span className="box-label" style={{ fontSize: '12px', display: 'block' }}>План</span>
          <span className="box-value" style={{ fontSize: '16px', fontWeight: 'bold' }}>{limit.toLocaleString()} ₽</span>
        </div>
        <div className="summary-box fact-light" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '10px 20px', borderRadius: '12px', textAlign: 'center', flex: 1 }}>
          <span className="box-label" style={{ fontSize: '12px', display: 'block' }}>Факт</span>
          <span className="box-value" style={{ fontSize: '16px', fontWeight: 'bold' }}>{spent.toLocaleString()} ₽</span>
        </div>
      </div>

      <div className="chart-body-flex bar-body cat-bar-body" style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
        <div className="y-axis" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: `${chartHeight}px`, fontSize: '10px', color: '#999' }}>
          {yLabels.map((label, i) => <span key={i}>{label}</span>)}
        </div>
        
        <div className="chart-plot-area" style={{ flex: 1, position: 'relative', height: `${chartHeight}px` }}>
          <div className="plot-relative bars-relative" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 0 }}>
            <div className="bar-group" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: '100%', gap: '20px' }}>
              <div
                className="bar plan-bar-light"
                style={{ 
                    height: `${planHeight}px`, 
                    width: '40px', 
                    background: 'linear-gradient(to top, #90caf9, #42a5f5)',
                    borderRadius: '6px 6px 0 0',
                    opacity: 0.7
                }}
              />
              <div
                className="bar fact-bar-light"
                style={{ 
                    height: `${factHeight}px`, 
                    width: '40px', 
                    background: 'linear-gradient(to top, #42a5f5, #1565c0)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 4px 10px rgba(21, 101, 192, 0.3)'
                }}
              />
            </div>
            
            <div
              className="dashed-line"
              style={{ 
                  position: 'absolute', 
                  width: '100%', 
                  borderTop: '1px dashed #ccc', 
                  bottom: `${planHeight}px` 
              }}
            />
            
            {diffPercent !== 0 && (
              <div
                className="custom-tooltip bar-tooltip"
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: `${Math.max(planHeight, factHeight) + 15}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 10
                }}
              >
                <div className="tooltip-text yellow-bg" style={{
                    backgroundColor: diffPercent > 0 ? '#fff3cd' : '#d4edda',
                    color: diffPercent > 0 ? '#856404' : '#155724',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: `1px solid ${diffPercent > 0 ? '#ffeeba' : '#c3e6cb'}`
                }}>
                  {diffPercent > 0 ? 'Перерасход' : 'Экономия'} {Math.abs(diffPercent)}%
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryBarChart;
