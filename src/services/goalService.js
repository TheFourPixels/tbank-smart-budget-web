import { ApiService } from './ApiService.js';

class GoalService {
  constructor() {
    this.apiService = new ApiService('http://goal-service:8087');
  }

  setAuthToken(token) {
    this.apiService.setAuthToken(token);
  }

  async createGoal(goalData) {
    return await this.apiService.request('/api/v1/goals', {
      method: 'POST',
      body: JSON.stringify(goalData)
    });
  }

  async getGoal(id) {
    return await this.apiService.request(`/api/v1/goals/${id}`);
  }

  async updateGoal(id, goalData) {
    return await this.apiService.request(`/api/v1/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goalData)
    });
  }

  async deleteGoal(id) {
    return await this.apiService.request(`/api/v1/goals/${id}`, {
      method: 'DELETE'
    });
  }

  async contributeToGoal(id, amount) {
    return await this.apiService.request(`/api/v1/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
  }

  async listCompleted(year, month) {
    const queryParams = new URLSearchParams({ year, month });
    return await this.apiService.request(`/api/v1/goals/completed?${queryParams}`);
  }

  async listActive(year, month) {
    const queryParams = new URLSearchParams({ year, month });
    return await this.apiService.request(`/api/v1/goals/active?${queryParams}`);
  }

  async getAllGoals() {
    try {
      const [completed, active] = await Promise.all([
        this.listCompleted(new Date().getFullYear(), new Date().getMonth() + 1),
        this.listActive(new Date().getFullYear(), new Date().getMonth() + 1)
      ]);
      
      return {
        completed: completed || [],
        active: active || []
      };
    } catch (error) {
      console.error('Ошибка получения всех целей:', error);
      return { completed: [], active: [] };
    }
  }
}

export const goalService = new GoalService();
