import { budgetApiService } from './ApiService.js';

class CategoryService {
  /**
   * Создание новой категории
   * @param {Object} categoryData - Данные категории
   * @param {string} categoryData.name - Название категории
   * @returns {Promise<Object>}
   */
  async createCategory(categoryData) {
    return await budgetApiService.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  /**
   * Получение всех категорий
   * @param {Object} params - Параметры пагинации
   * @returns {Promise<Object>}
   */
  async getCategories(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.size) queryParams.append('size', params.size);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/categories?${queryString}` : '/categories';
    
    return await budgetApiService.request(url);
  }

  /**
   * Обновление категории
   * @param {number} id - ID категории
   * @param {Object} categoryData - Данные для обновления
   * @returns {Promise<Object>}
   */
  async updateCategory(id, categoryData) {
    return await budgetApiService.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData),
    });
  }

  /**
   * Удаление категории
   * @param {number} id - ID категории
   * @returns {Promise<void>}
   */
  async deleteCategory(id) {
    return await budgetApiService.request(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Получение категории по ID
   * @param {number} id - ID категории
   * @returns {Promise<Object>}
   */
  async getCategory(id) {
    return await budgetApiService.request(`/categories/${id}`);
  }

  /**
   * Получение статистики по категории
   * @param {number} categoryId - ID категории
   * @param {number} year - Год
   * @param {number} month - Месяц
   * @returns {Promise<Object>}
   */
  async getCategoryStats(categoryId, year, month) {
    return await budgetApiService.request(`/categories/${categoryId}/stats/${year}/${month}`);
  }
}

export const categoryService = new CategoryService();