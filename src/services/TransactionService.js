import { budgetApiService } from './ApiService';

class TransactionService {
  /**
   * Получение списка транзакций
   * @param {Object} filters - фильтры (дата, категория, тип)
   * @param {number} page - номер страницы
   * @param {number} limit - лимит на страницу
   */
  async getTransactions({ startDate, endDate, categoryId, type } = {}, page = 0, limit = 20) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: limit.toString()
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (categoryId) params.append('categoryId', categoryId);
      if (type) params.append('type', type);

      const response = await budgetApiService.get(`/transactions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return this.getMockTransactions();
    }
  }

  /**
   * Получение статистики по транзакциям
   * @param {string} period - период (day, week, month, year)
   */
  async getStats(period = 'month') {
    try {
      const response = await budgetApiService.get(`/transactions/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return this.getMockStats();
    }
  }

  /**
   * Создание новой транзакции
   */
  async createTransaction(transactionData) {
    try {
      const response = await budgetApiService.post('/transactions', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Обновление категории транзакции
   */
  async updateTransactionCategory(transactionId, categoryId) {
    try {
      const response = await budgetApiService.patch(`/transactions/${transactionId}/category`, { categoryId });
      return response.data;
    } catch (error) {
      console.error('Error updating transaction category:', error);
      throw error;
    }
  }

  /**
   * Удаление транзакции
   */
  async deleteTransaction(transactionId) {
    try {
      await budgetApiService.delete(`/transactions/${transactionId}`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  /**
   * Получение категорий для транзакций
   */
  async getCategories() {
    try {
      const response = await budgetApiService.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return this.getMockCategories();
    }
  }

  // Моковые данные для демонстрации (без иконок)
  getMockTransactions() {
    return {
      content: [
        {
          id: 1,
          date: new Date().toISOString(),
          description: 'Яндекс.Еда',
          amount: -1250,
          currency: 'RUB',
          category: { id: 1, name: 'Еда', color: '#FF6B6B' },
          type: 'EXPENSE'
        },
        {
          id: 2,
          date: new Date(Date.now() - 86400000).toISOString(),
          description: 'Зарплата',
          amount: 85000,
          currency: 'RUB',
          category: { id: 2, name: 'Доход', color: '#4CAF50' },
          type: 'INCOME'
        },
        {
          id: 3,
          date: new Date(Date.now() - 172800000).toISOString(),
          description: 'АЗС Лукойл',
          amount: -3500,
          currency: 'RUB',
          category: { id: 3, name: 'Транспорт', color: '#2196F3' },
          type: 'EXPENSE'
        },
        {
          id: 4,
          date: new Date(Date.now() - 259200000).toISOString(),
          description: 'Озон',
          amount: -4500,
          currency: 'RUB',
          category: { id: 4, name: 'Покупки', color: '#9C27B0' },
          type: 'EXPENSE'
        },
        {
          id: 5,
          date: new Date(Date.now() - 345600000).toISOString(),
          description: 'Связной',
          amount: -750,
          currency: 'RUB',
          category: { id: 5, name: 'Связь', color: '#FF9800' },
          type: 'EXPENSE'
        }
      ],
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        totalPages: 1,
        totalElements: 5
      }
    };
  }

  getMockStats() {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      period: 'month',
      startDate: monthStart.toISOString(),
      endDate: today.toISOString(),
      income: 85000,
      expense: 9250,
      balance: 75750,
      categories: [
        { id: 1, name: 'Еда', amount: 1250, percentage: 13.5 },
        { id: 3, name: 'Транспорт', amount: 3500, percentage: 37.8 },
        { id: 4, name: 'Покупки', amount: 4500, percentage: 48.6 }
      ]
    };
  }

  getMockCategories() {
    return [
      { id: 1, name: 'Еда', color: '#FF6B6B' },
      { id: 2, name: 'Доход', color: '#4CAF50' },
      { id: 3, name: 'Транспорт', color: '#2196F3' },
      { id: 4, name: 'Покупки', color: '#9C27B0' },
      { id: 5, name: 'Связь', color: '#FF9800' },
      { id: 6, name: 'Развлечения', color: '#E91E63' },
      { id: 7, name: 'Здоровье', color: '#00BCD4' },
      { id: 8, name: 'Образование', color: '#8BC34A' }
    ];
  }
}

export const transactionService = new TransactionService();