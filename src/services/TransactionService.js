// services/TransactionService.js
import { transactionApiService } from './ApiService';

export const transactionService = {

  getTransactions: async (params = {}) => {
    try {
      const {
        page = 0,
        size = 10,
        categoryId,
        year,
        month,
        sort = 'date,desc'
      } = params;

      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('size', size);
      queryParams.append('sort', sort);

      if (categoryId) queryParams.append('categoryId', categoryId);
      if (year) queryParams.append('year', year);
      if (month) queryParams.append('month', month);

      const endpoint = `/transactions?${queryParams.toString()}`;
      const response = await transactionApiService.request(endpoint, { method: 'GET' });
      
      // Преобразуем данные в формат, ожидаемый компонентом
      if (response && response.content) {
        const transformedContent = response.content.map(transaction => ({
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          isIncome: transaction.isIncome,
          date: transaction.transactionDate,
          description: transaction.description,
          merchant: transaction.merchantName,
          categoryId: transaction.category?.id || 999,
          category: transaction.category,
          externalId: transaction.externalId,
          mcc: transaction.mcc
        }));
        
        return {
          ...response,
          content: transformedContent
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  getTransactionById: async (id) => {
    try {
      const transaction = await transactionApiService.request(`/transactions/${id}`, { method: 'GET' });
      
      return {
        id: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        isIncome: transaction.isIncome,
        date: transaction.transactionDate,
        description: transaction.description,
        merchant: transaction.merchantName,
        categoryId: transaction.category?.id || 999,
        category: transaction.category,
        externalId: transaction.externalId,
        mcc: transaction.mcc
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  },

  updateTransactionCategory: async (transactionId, categoryId) => {
    try {
      const response = await transactionApiService.request(
        `/transactions/${transactionId}/category`,
        {
          method: 'PATCH',
          body: JSON.stringify({ categoryId })
        }
      );
      
      return {
        id: response.id,
        amount: response.amount,
        type: response.type,
        isIncome: response.isIncome,
        date: response.transactionDate,
        description: response.description,
        merchant: response.merchantName,
        categoryId: response.category?.id || 999,
        category: response.category,
        externalId: response.externalId,
        mcc: response.mcc
      };
    } catch (error) {
      console.error('Error updating transaction category:', error);
      throw error;
    }
  },

  syncTransactions: async (year, month) => {
    try {
      const queryParams = new URLSearchParams();
      if (year) queryParams.append('year', year);
      if (month) queryParams.append('month', month);

      const endpoint = `/transactions/sync${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await transactionApiService.request(endpoint, { method: 'POST' });
    } catch (error) {
      console.error('Error syncing transactions:', error);
      throw error;
    }
  },

  getCategoryTotal: async (categoryId) => {
    try {
      const endpoint = `/transactions/categories/${categoryId}/total`;
      return await transactionApiService.request(endpoint, { method: 'GET' });
    } catch (error) {
      console.error('Error fetching category total:', error);
      throw error;
    }
  },

  createTransaction: async (transactionData) => {
    try {
      console.log(transactionData)
      return await transactionApiService.request('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionData)
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },


  
};

export default transactionService;