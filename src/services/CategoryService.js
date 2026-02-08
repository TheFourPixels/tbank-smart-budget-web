import { budgetApiService } from './ApiService.js';

class CategoryService {

  async createCategory(categoryData) {
    return await budgetApiService.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async getCategories(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.size) queryParams.append('size', params.size);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/categories?${queryString}` : '/categories';
    
    return await budgetApiService.request(url);
  }

  async updateCategory(id, categoryData) {
    return await budgetApiService.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return await budgetApiService.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async getCategory(id) {
    return await budgetApiService.request(`/categories/${id}`);
  }

  async getCategoryStats(categoryId, year, month) {
    return await budgetApiService.request(`/categories/${categoryId}/stats/${year}/${month}`);
  }
}

export const categoryService = new CategoryService();