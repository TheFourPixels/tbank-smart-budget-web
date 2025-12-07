import { budgetApiService } from './ApiService.js';

class BudgetService {
  /**
   * Создание или обновление бюджета на период
   * @param {Object} budgetData - Данные бюджета
   * @param {number} budgetData.year - Год
   * @param {number} budgetData.month - Месяц
   * @param {number} budgetData.totalIncome - Общий доход
   * @param {Array} budgetData.limits - Лимиты по категориям
   * @returns {Promise<Object>}
   */
  async createOrUpdateBudget(budgetData) {
    const apiData = {
      year: budgetData.year,
      month: budgetData.month,
      totalIncome: budgetData.totalIncome,
      limits: budgetData.limits.map(limit => ({
        categoryId: limit.categoryId,
        limitValue: limit.limitValue,
        limitType: limit.limitType || 'ABSOLUTE'
      }))
    };

    return await budgetApiService.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  /**
   * Получение бюджета на период
   * @param {number} year - Год
   * @param {number} month - Месяц
   * @returns {Promise<Object>}
   */
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

  /**
   * Удаление бюджета на период
   * @param {number} year - Год
   * @param {number} month - Месяц
   * @returns {Promise<void>}
   */
  async deleteBudget(year, month) {
    return await budgetApiService.request(`/budgets/${year}/${month}`, {
      method: 'DELETE',
    });
  }

  /**
   * Расчет суммы распределения по категориям
   * @param {Array} limits - Лимиты по категориям
   * @returns {number} Сумма всех лимитов
   */
  calculateTotalLimits(limits) {
    return limits.reduce((total, limit) => total + (limit.limitValue || 0), 0);
  }
}

export const budgetService = new BudgetService();