import React from 'react';
import AreaChart from './charts/AreaChart';
import BarChart from './charts/BarChart';

const PlanVsFactWidget = ({ dashboardData, budget, currentDate }) => {
  // Добавляем проверки на существование данных
  if (!dashboardData || !budget) return null;

  const financialSummary = dashboardData.financialSummary || {};
  const planAmount = budget.total_income || 0;
  const factAmount = financialSummary.totalSpent || 0;
  const difference = factAmount - planAmount;
  const differencePercent = planAmount > 0 ? Math.round((difference / planAmount) * 100) : 0;

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const monthName = monthNames[currentDate?.getMonth()] || '';
  const year = currentDate?.getFullYear() || '';

  return (
    <>
      <h2 className="section-title">План vs Факт</h2>
      <p className="section-desc">
        Тут учитываются ваши планы<br />и сравниваются с получившимися<br />результатами
      </p>

      <div className="pvf-main-card">
        <div className="pvf-summary-col">
          <div className="summary-box plan-box">
            <span className="box-label">План</span>
            <span className="box-value">{Math.round(planAmount).toLocaleString()} Р</span>
          </div>
          <div className="summary-box fact-box">
            <span className="box-label">Факт</span>
            <span className="box-value">{Math.round(factAmount).toLocaleString()} Р</span>
          </div>
        </div>

        <div className="chart-card area-chart">
          <div className="chart-header">
            <h3>График расходов</h3>
            <span className="chart-date">{monthName} {year}</span>
          </div>
          <div className="chart-body-flex">
            <div className="y-axis">
              <span>120k</span><span>105k</span><span>90k</span><span>75k</span>
              <span>60k</span><span>45k</span><span>30k</span><span>15k</span>
            </div>
            <div className="chart-plot-area">
              <AreaChart 
                planAmount={planAmount} 
                factAmount={factAmount}
                differencePercent={differencePercent}
              />
            </div>
          </div>
          <div className="x-axis">
            <span>04</span><span>08</span><span>12</span><span>16</span>
            <span>20</span><span>24</span><span>28</span><span>31</span>
          </div>
        </div>

        <div className="chart-card bar-chart">
          <div className="chart-body-flex bar-body">
            <div className="y-axis">
              <span>{Math.round(Math.max(planAmount, factAmount) / 1000)}k</span>
              <span>{Math.round(Math.max(planAmount, factAmount) * 0.75 / 1000)}k</span>
              <span>{Math.round(Math.max(planAmount, factAmount) * 0.5 / 1000)}k</span>
              <span>0</span>
            </div>
            <div className="chart-plot-area">
              <BarChart 
                planAmount={planAmount}
                factAmount={factAmount}
                differencePercent={differencePercent}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanVsFactWidget;
