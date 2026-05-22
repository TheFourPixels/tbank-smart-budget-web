import { transactionApiService } from './ApiService';

const MOCK_CATEGORIES = [
  { id: 1, name: 'Еда', color: '#FF6B6B' },
  { id: 2, name: 'Доход', color: '#4CAF50' },
  { id: 3, name: 'Транспорт', color: '#2196F3' },
  { id: 4, name: 'Покупки', color: '#9C27B0' },
  { id: 5, name: 'Связь', color: '#FF9800' },
  { id: 6, name: 'Развлечения', color: '#E91E63' },
  { id: 7, name: 'Здоровье', color: '#00BCD4' },
  { id: 8, name: 'Образование', color: '#8BC34A' },
];

export const transactionService = {
  setAuthToken(token) {
    transactionApiService.setAuthToken(token);
  },

  async getCategories() {
    try {
      const response = await transactionApiService.request('/categories');
      if (response && Array.isArray(response) && response.length > 0) {
        return response;
      }
      return MOCK_CATEGORIES;
    } catch (error) {
      console.warn('Категории не загружены с API, используем моки:', error.message);
      return MOCK_CATEGORIES;
    }
  },

  async getTransactions({
    page = 0,
    size = 20,
    startDateMillis,
    endDateMillis,
    categoryId,
    query,
  } = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });

      if (startDateMillis) queryParams.append('startDateMillis', startDateMillis.toString());
      if (endDateMillis) queryParams.append('endDateMillis', endDateMillis.toString());
      if (categoryId) queryParams.append('categoryId', categoryId.toString());
      if (query) queryParams.append('query', query);

      const response = await transactionApiService.request(`/transactions?${queryParams}`);
      return response;
    } catch (error) {
      console.error('Ошибка получения транзакций:', error);
      return this.getMockTransactions();
    }
  },

  async createTransaction(transactionData) {
    try {
      const payload = {
        amount: transactionData.amount,
        categoryId: transactionData.categoryId,
        transactionTime: transactionData.transactionTime,
        type: transactionData.type,
        description: transactionData.description,
      };

      return await transactionApiService.request('/transactions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Ошибка создания транзакции:', error);
      throw error;
    }
  },

  getMockTransactions() {
    return {
      content: [
        {
          id: 1,
          transactionDate: new Date().toISOString(),
          description: 'Яндекс.Еда',
          amount: -1250,
          type: 'EXPENSE',
          category: { id: 1, name: 'Еда' },
        },
        {
          id: 2,
          transactionDate: new Date(Date.now() - 86400000).toISOString(),
          description: 'Зарплата',
          amount: 85000,
          type: 'INCOME',
          category: { id: 2, name: 'Доход' },
        },
      ],
      pageable: { pageNumber: 0, pageSize: 20, totalPages: 1, totalElements: 2 },
    };
  },

  getMockCategories() {
    return MOCK_CATEGORIES;
  },
};
