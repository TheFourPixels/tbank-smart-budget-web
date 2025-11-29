// services/budgetService.js
import { apiService } from './api';
import { Budget } from '../models/Budget';

class BudgetService {

  async createOrUpdateBudget(budget) {
    const errors = budget.validate();
    if (errors.length > 0) {
      throw {
        code: 400,
        message: `Validation failed: ${errors.join(', ')}`
      };
    }

    const response = await apiService.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget.toJSON()),
    });

    return new Budget(
      response.year,
      response.month,
      response.total_income,
      response.limits
    );
  }

  async getBudget(year, month) {
    const response = await apiService.request(`/budgets/${year}/${month}`);
    
    return new Budget(
      response.year,
      response.month,
      response.total_income,
      response.limits
    );
  }

  async deleteBudget(year, month) {
    return await apiService.request(`/budgets/${year}/${month}`, {
      method: 'DELETE',
    });
  }

  async createPercentageBudget(year, month, totalIncome, categories) {
    const budget = Budget.createFromPercentageDistribution(
      year, 
      month, 
      totalIncome, 
      categories
    );

    return await this.createOrUpdateBudget(budget);
  }

  async budgetExists(year, month) {
    try {
      await this.getBudget(year, month);
      return true;
    } catch (error) {
      if (error.code === 404) {
        return false;
      }
      throw error;
    }
  }

  async getCurrentBudget() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    return await this.getBudget(year, month);
  }
}

export const budgetService = new BudgetService();