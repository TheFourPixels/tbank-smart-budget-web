import { transactionApiService } from './ApiService';

export const transactionService = {
  async getTransactions({
    page = 0,
    size = 20,
    startDate,
    endDate,
    categoryId,
    type,
  } = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      if (categoryId) queryParams.append('categoryId', categoryId);
      if (type) queryParams.append('type', type);

      const response = await transactionApiService.request(`/transactions?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Ошибка получения транзакций:', error);
      return this.getMockTransactions();
    }
  },

  async getTransactionById(id) {
    try {
      return await transactionApiService.request(`/transactions/${id}`);
    } catch (error) {
      console.error('Ошибка получения транзакции по ID:', error);
      throw error;
    }
  },

  async updateTransactionCategory(transactionId, categoryId) {
    try {
      return await transactionApiService.request(
        `/transactions/${transactionId}/category`,
        {
          method: 'PATCH',
          body: JSON.stringify({ categoryId })
        }
      );
    } catch (error) {
      console.error('Ошибка обновления категории транзакции:', error);
      throw error;
    }
  },

  async deleteTransaction(transactionId) {
    try {
      await transactionApiService.request(`/transactions/${transactionId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Ошибка удаления транзакции:', error);
      throw error;
    }
  },

  async syncTransactions(year, month) {
    try {
      const queryParams = new URLSearchParams();
      if (year) queryParams.append('year', year.toString());
      if (month) queryParams.append('month', month.toString());
      
      await transactionApiService.request(
        `/transactions/sync?${queryParams.toString()}`,
        { method: 'POST' }
      );
    } catch (error) {
      console.error('Ошибка синхронизации транзакций:', error);
      throw error;
    }
  },

  async getCategoryTotal(categoryId) {
    try {
      return await transactionApiService.request(
        `/transactions/categories/${categoryId}/total`
      );
    } catch (error) {
      console.error('Ошибка получения суммы по категории:', error);
      throw error;
    }
  },

  async createTransaction(transactionData) {
    try {
      return await transactionApiService.request(
        '/transactions',
        {
          method: 'POST',
          body: JSON.stringify(transactionData)
        }
      );
    } catch (error) {
      console.error('Ошибка создания транзакции:', error);
      throw error;
    }
  },

  async getCategories() {
    try {
      return await transactionApiService.request('/categories');
    } catch (error) {
      console.error('Ошибка получения категорий:', error);
      return this.getMockCategories();
    }
  },

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
          type: 'EXPENSE',
        },
        {
          id: 2,
          date: new Date(Date.now() - 86400000).toISOString(),
          description: 'Зарплата',
          amount: 85000,
          currency: 'RUB',
          category: { id: 2, name: 'Доход', color: '#4CAF50' },
          type: 'INCOME',
        },
        {
          id: 3,
          date: new Date(Date.now() - 172800000).toISOString(),
          description: 'АЗС Лукойл',
          amount: -3500,
          currency: 'RUB',
          category: { id: 3, name: 'Транспорт', color: '#2196F3' },
          type: 'EXPENSE',
        },
        {
          id: 4,
          date: new Date(Date.now() - 259200000).toISOString(),
          description: 'Озон',
          amount: -4500,
          currency: 'RUB',
          category: { id: 4, name: 'Покупки', color: '#9C27B0' },
          type: 'EXPENSE',
        },
        {
          id: 5,
          date: new Date(Date.now() - 345600000).toISOString(),
          description: 'Связной',
          amount: -750,
          currency: 'RUB',
          category: { id: 5, name: 'Связь', color: '#FF9800' },
          type: 'EXPENSE',
        },
      ],
      pageable: {
        pageNumber: 0,
        pageSize: 20,
        totalPages: 1,
        totalElements: 5,
      },
    };
  },

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
        { id: 4, name: 'Покупки', amount: 4500, percentage: 48.6 },
      ],
    };
  },

  getMockCategories() {
    return [
      { id: 1, name: 'Еда', color: '#FF6B6B' },
      { id: 2, name: 'Доход', color: '#4CAF50' },
      { id: 3, name: 'Транспорт', color: '#2196F3' },
      { id: 4, name: 'Покупки', color: '#9C27B0' },
      { id: 5, name: 'Связь', color: '#FF9800' },
      { id: 6, name: 'Развлечения', color: '#E91E63' },
      { id: 7, name: 'Здоровье', color: '#00BCD4' },
      { id: 8, name: 'Образование', color: '#8BC34A' },
    ];
  },
};
