import { ApiService } from './ApiService.js';

class DashboardService {
  constructor() {
    this.apiService = new ApiService('http://dashboard-service:8088');
  }

  setAuthToken(token) {
    this.apiService.setAuthToken(token);
  }

  async getDashboardData(year, month) {
    try {
      const data = await this.apiService.request(`/api/v1/dashboard/${year}/${month}`);
      return this.transformDashboardData(data);
    } catch (error) {
      console.error('Ошибка получения данных дашборда:', error);
      throw error;
    }
  }

  transformDashboardData(data) {
    return {
      period: {
        year: data.year,
        month: data.month
      },
      financialSummary: {
        totalIncome: data.totalIncome || 0,
        totalSpent: data.totalSpent || 0,
        remainingBudget: data.remainingBudget || 0
      },
      categoryStats: (data.categoryStats || []).map(stat => ({
        id: stat.categoryId,
        name: stat.categoryName,
        limit: stat.limit || 0,
        spent: stat.spent || 0,
        progressPercent: stat.progressPercent || 0,
        color: stat.color || '#CCCCCC',
        overLimit: stat.overLimit || false
      })),
      recentTransactions: (data.recentTransactions || []).map(transaction => ({
        id: transaction.id,
        merchant: transaction.merchant || '',
        description: transaction.description || '',
        amount: transaction.amount || 0,
        date: transaction.date ? new Date(transaction.date) : new Date(),
        categoryName: transaction.categoryName || '',
        isIncome: transaction.income || false
      })),
      activeGoals: (data.activeGoals || []).map(goal => ({
        id: goal.id,
        name: goal.name,
        saved: goal.saved || 0,
        target: goal.target || 0,
        progressPercent: goal.progressPercent || 0,
        daysLeft: goal.daysLeft || 0,
        recommendedMonthly: goal.recommendedMonthly || 0
      }))
    };
  }

  async getMonthlyReport(year, month) {
    try {
      const dashboardData = await this.getDashboardData(year, month);
      
      return {
        period: dashboardData.period,
        summary: dashboardData.financialSummary,
        spendingByCategory: this.calculateSpendingByCategory(dashboardData.categoryStats),
        goalsProgress: this.calculateGoalsProgress(dashboardData.activeGoals),
        recentTransactions: dashboardData.recentTransactions,
        budgetHealth: this.calculateBudgetHealth(dashboardData)
      };
    } catch (error) {
      console.error('Ошибка формирования месячного отчета:', error);
      throw error;
    }
  }

  calculateSpendingByCategory(categoryStats) {
    const totalSpent = categoryStats.reduce((sum, stat) => sum + stat.spent, 0);
    
    return categoryStats
      .filter(stat => stat.spent > 0)
      .map(stat => ({
        id: stat.id,
        name: stat.name,
        amount: stat.spent,
        percentage: totalSpent > 0 ? Math.round((stat.spent / totalSpent) * 100) : 0,
        color: stat.color
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  calculateGoalsProgress(activeGoals) {
    return activeGoals.map(goal => ({
      id: goal.id,
      name: goal.name,
      progress: goal.progressPercent,
      saved: goal.saved,
      target: goal.target,
      daysLeft: goal.daysLeft,
      status: this.getGoalStatus(goal.progressPercent, goal.daysLeft)
    }));
  }

  getGoalStatus(progress, daysLeft) {
    if (progress >= 100) return 'completed';
    if (daysLeft <= 0) return 'overdue';
    if (progress >= 75) return 'onTrack';
    if (progress >= 50) return 'inProgress';
    return 'atRisk';
  }

  calculateBudgetHealth(dashboardData) {
    const { totalIncome, totalSpent, remainingBudget } = dashboardData.financialSummary;
    const spendingRatio = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
    const savingsRate = totalIncome > 0 ? (remainingBudget / totalIncome) * 100 : 0;

    let healthScore = 100;
    let healthStatus = 'excellent';

    if (spendingRatio > 90) {
      healthScore -= 40;
      healthStatus = 'critical';
    } else if (spendingRatio > 80) {
      healthScore -= 20;
      healthStatus = 'warning';
    } else if (spendingRatio > 70) {
      healthScore -= 10;
      healthStatus = 'fair';
    }

    if (savingsRate < 10) {
      healthScore -= 20;
      if (healthStatus !== 'critical') healthStatus = 'warning';
    } else if (savingsRate < 20) {
      healthScore -= 10;
      if (healthStatus === 'excellent') healthStatus = 'good';
    }

    return {
      score: Math.max(healthScore, 0),
      status: healthStatus,
      spendingRatio: Math.round(spendingRatio),
      savingsRate: Math.round(savingsRate),
      recommendations: this.getBudgetRecommendations(spendingRatio, savingsRate)
    };
  }

  getBudgetRecommendations(spendingRatio, savingsRate) {
    const recommendations = [];

    if (spendingRatio > 80) {
      recommendations.push('Высокий уровень расходов. Рассмотрите возможность оптимизации трат.');
    }

    if (savingsRate < 15) {
      recommendations.push('Низкий уровень сбережений. Попробуйте увеличить откладываемую сумму.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Ваш бюджет находится в хорошем состоянии!');
    }

    return recommendations;
  }

  async getYearlyReport(year) {
    try {
      const monthlyReports = [];
      
      for (let month = 1; month <= 12; month++) {
        try {
          const report = await this.getMonthlyReport(year, month);
          monthlyReports.push({
            month,
            summary: report.summary,
            spendingByCategory: report.spendingByCategory,
            budgetHealth: report.budgetHealth
          });
        } catch (error) {
          console.warn(`Не удалось получить данные за ${month} месяц ${year} года:`, error);
          // Пропускаем месяц, если данные недоступны
        }
      }

      return this.aggregateYearlyData(monthlyReports);
    } catch (error) {
      console.error('Ошибка формирования годового отчета:', error);
      throw error;
    }
  }

  aggregateYearlyData(monthlyReports) {
    if (monthlyReports.length === 0) {
      return {
        totalIncome: 0,
        totalSpent: 0,
        averageMonthlyIncome: 0,
        averageMonthlySpent: 0,
        yearlySavings: 0,
        categoryTrends: [],
        monthlyTrend: []
      };
    }

    const totalIncome = monthlyReports.reduce((sum, report) => sum + report.summary.totalIncome, 0);
    const totalSpent = monthlyReports.reduce((sum, report) => sum + report.summary.totalSpent, 0);
    const yearlySavings = totalIncome - totalSpent;
    const averageMonthlyIncome = totalIncome / monthlyReports.length;
    const averageMonthlySpent = totalSpent / monthlyReports.length;

    // Агрегация по категориям
    const categoryMap = new Map();
    monthlyReports.forEach(report => {
      report.spendingByCategory.forEach(category => {
        if (!categoryMap.has(category.id)) {
          categoryMap.set(category.id, {
            id: category.id,
            name: category.name,
            totalSpent: 0,
            monthlyData: Array(12).fill(0)
          });
        }
        
        const categoryData = categoryMap.get(category.id);
        categoryData.totalSpent += category.amount;
        categoryData.monthlyData[report.month - 1] = category.amount;
      });
    });

    const categoryTrends = Array.from(categoryMap.values())
      .map(category => ({
        ...category,
        averageMonthly: category.totalSpent / monthlyReports.length
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    // Месячные тренды
    const monthlyTrend = monthlyReports.map(report => ({
      month: report.month,
      income: report.summary.totalIncome,
      spent: report.summary.totalSpent,
      savings: report.summary.totalIncome - report.summary.totalSpent
    }));

    return {
      totalIncome,
      totalSpent,
      averageMonthlyIncome,
      averageMonthlySpent,
      yearlySavings,
      categoryTrends,
      monthlyTrend
    };
  }

  async getComparisonData(year, month) {
    try {
      const currentData = await this.getMonthlyReport(year, month);
      
      // Получаем данные за предыдущий месяц
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear = year - 1;
      }
      
      let previousData = null;
      try {
        previousData = await this.getMonthlyReport(prevYear, prevMonth);
      } catch (error) {
        console.warn('Данные за предыдущий период недоступны');
      }

      return {
        current: currentData,
        previous: previousData,
        comparison: previousData ? this.calculateComparison(currentData, previousData) : null
      };
    } catch (error) {
      console.error('Ошибка получения данных для сравнения:', error);
      throw error;
    }
  }

  calculateComparison(current, previous) {
    const incomeDiff = current.summary.totalIncome - previous.summary.totalIncome;
    const spentDiff = current.summary.totalSpent - previous.summary.totalSpent;
    const savingsDiff = current.summary.remainingBudget - previous.summary.remainingBudget;

    return {
      income: {
        current: current.summary.totalIncome,
        previous: previous.summary.totalIncome,
        difference: incomeDiff,
        percentage: previous.summary.totalIncome !== 0 
          ? Math.round((incomeDiff / previous.summary.totalIncome) * 100) 
          : (incomeDiff > 0 ? 100 : 0)
      },
      spent: {
        current: current.summary.totalSpent,
        previous: previous.summary.totalSpent,
        difference: spentDiff,
        percentage: previous.summary.totalSpent !== 0 
          ? Math.round((spentDiff / previous.summary.totalSpent) * 100) 
          : (spentDiff > 0 ? 100 : 0)
      },
      savings: {
        current: current.summary.remainingBudget,
        previous: previous.summary.remainingBudget,
        difference: savingsDiff,
        percentage: previous.summary.remainingBudget !== 0 
          ? Math.round((savingsDiff / previous.summary.remainingBudget) * 100) 
          : (savingsDiff > 0 ? 100 : 0)
      }
    };
  }
}

export const dashboardService = new DashboardService();
