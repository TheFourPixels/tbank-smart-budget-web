import { budgetApiService } from './ApiService.js';

class BudgetService {
  async createOrUpdateBudget(budgetData) {
    const apiData = {
      year: budgetData.year,
      month: budgetData.month,
      totalIncome: budgetData.totalIncome,
      limits: budgetData.limits.map(limit => ({
        categoryId: limit.categoryId,
        limitValue: limit.limitValue,
        limitType: limit.limitType
      }))
    };

    return await budgetApiService.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async getBudget(year, month) {
    const data = await budgetApiService.request(`/budgets/${year}/${month}`);
    return {
      ...data,
      total_income: data.totalIncome,
      limits: data.limits?.map(limit => ({
        category_id: limit.categoryId,
        limit_value: limit.limitValue,
        limit_type: limit.limitType
      })) || []
    };
  }

  async getBudgetSummary(year, month) {
    try {
      const budget = await this.getBudget(year, month);
      
      if (!budget) {
        return this.getDefaultBudgetSummary(year, month);
      }

      const totalLimit = budget.limits?.reduce((sum, limit) => {
        const limitValue = limit.limit_type === 'PERCENT' 
          ? (budget.total_income * limit.limit_value) / 100
          : limit.limit_value;
        return sum + limitValue;
      }, 0) || 0;

      const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      const monthName = monthNames[month - 1] || 'Текущий месяц';

      return {
        title: `Бюджет на ${monthName} ${year}`,
        balance: budget.total_income || 0,
        period: `${monthName} ${year}`,
        income: budget.total_income || 0,
        expenseLimit: totalLimit,
        freeMoney: Math.max((budget.total_income || 0) - totalLimit, 0)
      };
    } catch (error) {
      console.error('Ошибка получения сводки бюджета:', error);
      return this.getDefaultBudgetSummary(year, month);
    }
  }

  async getCategoryStats(year, month) {
    try {
      const budget = await this.getBudget(year, month);
      
      if (!budget || !budget.limits || budget.limits.length === 0) {
        return [];
      }

      const spendingData = await this.getCategorySpending(year, month);

      return budget.limits.map(limit => {
        const limitValue = limit.limit_type === 'PERCENT' 
          ? (budget.total_income * limit.limit_value) / 100
          : limit.limit_value;

        const categorySpending = spendingData.find(s => s.categoryId === limit.category_id);
        const spent = categorySpending?.spent || 0;
        const available = Math.max(limitValue - spent, 0);
        const progress = limitValue > 0 ? Math.min((spent / limitValue) * 100, 100) : 0;

        return {
          id: limit.category_id,
          limit: limitValue,
          spent: spent,
          available: available,
          progress: Math.round(progress)
        };
      });
    } catch (error) {
      console.error('Ошибка получения статистики категорий:', error);
      return [];
    }
  }

  async getCategorySpending(year, month) {
    try {
      const response = await budgetApiService.request(`/budgets/${year}/${month}/dashboard`);
      return response.categorySpending || [];
    } catch (error) {
      console.error('Ошибка получения трат по категориям:', error);
      return [];
    }
  }

  getDefaultBudgetSummary(year, month) {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthName = monthNames[month - 1] || 'Текущий месяц';
      
    const savedBalance = parseFloat(localStorage.getItem('budgetLimit') || 0);
    const savedExpenseLimit = parseFloat(localStorage.getItem('budgetExpenseLimit') || 0);

    return {
      title: localStorage.getItem('budgetName') || 'Мой бюджет',
      balance: savedBalance,
      period: `${monthName} ${year}`,
      income: savedBalance,
      expenseLimit: savedExpenseLimit,
      freeMoney: Math.max(savedBalance - savedExpenseLimit, 0)
    };
  }

  async deleteBudget(year, month) {
    return await budgetApiService.request(`/budgets/${year}/${month}`, {
      method: 'DELETE',
    });
  }

  async createSimpleBudget(year, month, totalIncome, categories) {
    const limits = categories.map(category => ({
      categoryId: category.categoryId,
      limitValue: category.percentage,
      limitType: 'PERCENT'
    }));

    const budgetData = {
      year,
      month,
      totalIncome,
      limits
    };

    return await this.createOrUpdateBudget(budgetData);
  }

  async addCategoryToBudget(data) {
    return await budgetApiService.request('/budget/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentBudget() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    try {
      return await this.getBudget(currentYear, currentMonth);
    } catch (error) {
      console.error('Ошибка получения текущего бюджета:', error);
      
      const savedYear = localStorage.getItem('budgetYear');
      const savedMonth = localStorage.getItem('budgetMonth');
      
      if (savedYear && savedMonth) {
        try {
          return await this.getBudget(parseInt(savedYear), parseInt(savedMonth));
        } catch (secondError) {
          console.error('Ошибка получения сохраненного бюджета:', secondError);
        }
      }
      
      throw error;
    }
  }
}

export const budgetService = new BudgetService();
