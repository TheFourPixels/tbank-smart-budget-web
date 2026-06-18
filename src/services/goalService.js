import { goalApiService } from './ApiService';

class GoalService {
  constructor() {
    this.apiService = goalApiService;
  }

  setAuthToken(token) {
    this.apiService.setAuthToken(token);
  }

  async createGoal(goalData) {
    // Swagger: POST /api/v1/goals
    return this.apiService.request('/goals', {
      method: 'POST',
      body: JSON.stringify({
        name: goalData.name,
        targetAmount: goalData.targetAmount,
        deadline: goalData.deadline
        // currentAmount не нужен при создании
      }),
    });
  }

  async getGoal(id) {
    // Swagger: GET /api/v1/goals/{id}
    return this.apiService.request(`/goals/${id}`);
  }

  async updateGoal(id, goalData) {
    // Swagger: PUT /api/v1/goals/{id}
    return this.apiService.request(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: goalData.name,
        targetAmount: goalData.targetAmount,
        deadline: goalData.deadline
      }),
    });
  }

  async deleteGoal(id) {
    // Swagger: DELETE /api/v1/goals/{id}
    return this.apiService.request(`/goals/${id}`, {
      method: 'DELETE',
    });
  }

  async contributeToGoal(id, amount) {
    // Swagger: POST /api/v1/goals/{id}/contribute
    return this.apiService.request(`/goals/${id}/contribute`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async listCompleted(year, month) {
    // Swagger: GET /api/v1/goals/completed?year=&month=
    const queryParams = new URLSearchParams({ 
      year: year.toString(), 
      month: month.toString() 
    });
    return this.apiService.request(`/goals/completed?${queryParams}`);
  }

  async listActive(year, month) {
    // Swagger: GET /api/v1/goals/active?year=&month=
    const queryParams = new URLSearchParams({ 
      year: year.toString(), 
      month: month.toString() 
    });
    return this.apiService.request(`/goals/active?${queryParams}`);
  }

  async getAllGoals() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    try {
      const [completed, active] = await Promise.all([
        this.listCompleted(year, month),
        this.listActive(year, month),
      ]);
      return {
        completed: completed || [],
        active: active || [],
      };
    } catch (error) {
      console.error('Ошибка получения всех целей:', error);
      return { completed: [], active: [] };
    }
  }
}

export const goalService = new GoalService();
