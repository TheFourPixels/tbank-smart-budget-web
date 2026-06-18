import React from 'react';

const GoalsWidget = ({ goalsData, currentDate }) => {
  const { completed = [], active = [] } = goalsData || {};
  const totalGoals = completed.length + active.length;
  const progressPercent = totalGoals > 0 ? Math.round((completed.length / totalGoals) * 100) : 0;

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const monthName = monthNames[currentDate?.getMonth()] || '';
  const year = currentDate?.getFullYear() || '';

  return (
    <>
      <h2 className="section-title">Цели</h2>
      <p className="section-desc">
        Анализируем, какие цели были<br />выполнены, а каких еще придется<br />достичь
      </p>

      <div className="cards-row goals-row">
        <div className="card progress-card">
          <h3 className="progress-title">Процент<br />достигнутых целей</h3>
          <div className="progress-circle-wrap">
            <div className="progress-circle">
              <div 
                className="progress-fill" 
                style={{ 
                  background: `conic-gradient(#4CAF50 ${progressPercent}%, #e0e0e0 ${progressPercent}% 100%)` 
                }}
              ></div>
              <div className="progress-center">
                <span className="pct">{progressPercent}%</span>
                <span className="pct-date">{monthName}, {year}</span>
              </div>
            </div>
          </div>
          <div className="progress-footer">
            <div className="p-stat">
              <span className="p-label">Достигнуто</span>
              <span className="p-val">{completed.length}</span>
            </div>
            <div className="p-stat">
              <span className="p-label">В процессе</span>
              <span className="p-val">{active.length}</span>
            </div>
          </div>
        </div>

        <div className="card list-card">
          <div className="list-header">
            <h3>Достигнуто</h3>
            <span className="list-count">{completed.length}</span>
          </div>
          <div className="list-body">
            {completed.slice(0, 5).map((goal, index) => (
              <div key={goal.id || index} className="list-item">
                <div className="item-icon achieved-icon">{index + 1}</div>
                <div className="item-text">
                  <span className="item-title">{goal.name || 'Без названия'}</span>
                  <span className="item-date">
                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString('ru-RU') : 'Дата не указана'}
                  </span>
                </div>
              </div>
            ))}
            {completed.length === 0 && (
              <div className="no-goals">Нет достигнутых целей</div>
            )}
          </div>
        </div>

        <div className="card list-card">
          <div className="list-header">
            <h3>В процессе</h3>
            <span className="list-count">{active.length}</span>
          </div>
          <div className="list-body">
            {active.slice(0, 5).map((goal, index) => (
              <div key={goal.id || index} className="list-item">
                <div className="item-icon inprog-icon">{index + 1}</div>
                <div className="item-text">
                  <span className="item-title">{goal.name || 'Без названия'}</span>
                  <span className="item-date">
                    {goal.deadline ? new Date(goal.deadline).toLocaleDateString('ru-RU') : 'Дата не указана'}
                  </span>
                </div>
              </div>
            ))}
            {active.length === 0 && (
              <div className="no-goals">Нет активных целей</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GoalsWidget;
