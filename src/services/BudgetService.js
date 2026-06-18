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

  // БАГ #1 ИСПРАВЛЕН: убран маппинг в snake_case — теперь возвращаем
  // camelCase (как отдаёт API), чтобы все компоненты работали единообразно.
  async getBudget(year, month) {
    const data = await budgetApiService.request(`/budgets/${year}/${month}`);
    return {
      ...data,
      totalIncome: data.totalIncome || 0,
      limits: data.limits?.map(limit => ({
        categoryId: limit.categoryId,
        limitValue: limit.limitValue,
        limitType: limit.limitType || 'SUM',
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
        const limitValue = limit.limitType === 'PERCENT'
          ? (budget.totalIncome * limit.limitValue) / 100
          : limit.limitValue;
        return sum + limitValue;
      }, 0) || 0;

      const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      const monthName = monthNames[month - 1] || 'Текущий месяц';

      return {
        title: `Бюджет на ${monthName} ${year}`,
        balance: budget.totalIncome || 0,
        period: `${monthName} ${year}`,
        income: budget.totalIncome || 0,
        expenseLimit: totalLimit,
        freeMoney: Math.max((budget.totalIncome || 0) - totalLimit, 0)
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
        const limitValue = limit.limitType === 'PERCENT'
          ? (budget.totalIncome * limit.limitValue) / 100
          : limit.limitValue;

        const categorySpending = spendingData.find(s => s.categoryId === limit.categoryId);
        const spent = categorySpending?.spent || 0;
        const available = Math.max(limitValue - spent, 0);
        const progress = limitValue > 0 ? Math.min((spent / limitValue) * 100, 100) : 0;

        return {
          id: limit.categoryId,
          limit: limitValue,
          spent,
          available,
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
      const rawList = response?.categorySpending || [];

      return rawList.map(item => ({
        categoryId: item.categoryId ?? item.id,
        categoryName: item.categoryName ?? item.name ?? 'Без названия',
        spent: item.spent || 0,
        color: item.color,
      }));
    } catch (error) {
      console.error('Ошибка получения трат по категориям:', error);
      return [];
    }
  }

  // БАГ #7 ИСПРАВЛЕН: убраны несуществующие ключи localStorage
  getDefaultBudgetSummary(year, month) {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthName = monthNames[month - 1] || 'Текущий месяц';

    return {
      title: 'Мой бюджет',
      balance: 0,
      period: `${monthName} ${year}`,
      income: 0,
      expenseLimit: 0,
      freeMoney: 0
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

    return await this.createOrUpdateBudget({ year, month, totalIncome, limits });
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
    return await this.getBudget(currentYear, currentMonth);
  }
}

export const budgetService = new BudgetService();
