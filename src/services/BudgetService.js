import { budgetApiService } from './ApiService.js';
import { transactionApiService } from './ApiService.js';

class BudgetService {
  async createOrUpdateBudget(budgetData) {
    const apiData = {
      year: budgetData.year,
      month: budgetData.month,
      totalIncome: budgetData.totalIncome,
      limits: budgetData.limits.map(limit => ({
        categoryId: limit.category_id,
        limitValue: limit.limit_value,
        limitType: limit.limit_type
      }))
    };

    return await budgetApiService.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async getBudget(year, month) {
    try {
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
    } catch (error) {
      if (error.status === 404) {
        return null; 
      }
      console.error('Ошибка получения бюджета:', error);
      throw error;
    }
  }

  /**
   * Получение сводки бюджета для карточки
   */
  async getBudgetSummary(year, month) {
    try {
      const budget = await this.getBudget(year, month);
      
      if (!budget) {
        return this.getDefaultBudgetSummary(year, month);
      }

      // Вычисляем общий лимит расходов
      const totalLimit = budget.limits?.reduce((sum, limit) => {
        let limitValue = 0;
        if (limit.limit_type === 'PERCENT') {
          limitValue = (budget.total_income * limit.limit_value) / 100;
        } else {
          limitValue = limit.limit_value;
        }
        return sum + limitValue;
      }, 0) || 0;

      const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                         'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      const monthName = monthNames[month - 1] || 'Текущий месяц';

      // Получаем общие траты за месяц
      let totalSpent = 0;
      try {
        const spending = await this.getCategorySpending(year, month);
        totalSpent = spending.reduce((sum, cat) => sum + cat.spent, 0);
      } catch (err) {
        console.error('Ошибка при расчете общих трат:', err);
      }

      return {
        title: `Бюджет на ${monthName} ${year}`,
        balance: budget.total_income || 0,
        period: `${monthName} ${year}`,
        income: budget.total_income || 0,
        expenseLimit: totalLimit,
        freeMoney: Math.max((budget.total_income || 0) - totalSpent, 0),
        totalSpent: totalSpent
      };
    } catch (error) {
      console.error('Ошибка получения сводки бюджета:', error);
      return this.getDefaultBudgetSummary(year, month);
    }
  }

  /**
   * Получение статистики по категориям на основе транзакций
   */
  async getCategoryStats(year, month) {
    try {
      // Получаем бюджет и лимиты
      const budget = await this.getBudget(year, month);
      
      if (!budget || !budget.limits || budget.limits.length === 0) {
        console.log('Бюджет или лимиты не найдены');
        return [];
      }

      // Получаем траты по категориям на основе транзакций
      const spendingData = await this.getCategorySpending(year, month);
      
      if (!spendingData || spendingData.length === 0) {
        console.log('Транзакции за период не найдены');
        // Возвращаем категории без трат
        return budget.limits.map(limit => {
          let limitValue = 0;
          if (limit.limit_type === 'PERCENT') {
            limitValue = (budget.total_income * limit.limit_value) / 100;
          } else {
            limitValue = limit.limit_value;
          }

          return {
            id: limit.category_id,
            limit: limitValue,
            spent: 0,
            available: limitValue,
            progress: 0
          };
        });
      }

      // Собираем статистику по категориям
      const categories = budget.limits.map(limit => {
        let limitValue = 0;
        if (limit.limit_type === 'PERCENT') {
          limitValue = (budget.total_income * limit.limit_value) / 100;
        } else {
          limitValue = limit.limit_value;
        }

        // Ищем траты для этой категории
        console.log(spendingData)

        const categorySpending = spendingData.find(s => s.id === limit.category_id);
        const spent = categorySpending?.spent || 0;
        const available = Math.max(limitValue - spent, 0);
        const progress = limitValue > 0 ? Math.min((spent / limitValue) * 100, 100) : 0;

        return {
          id: limit.category_id,
          limit: limitValue,
          spent: spent,
          available: available,
          progress: Math.round(progress)
        };
      });

      console.log('Статистика категорий:', categories);
      return categories;
    } catch (error) {
      console.error('Ошибка получения статистики категорий:', error);
      return [];
    }
  }

  /**
   * Получение трат по категориям на основе всех транзакций
   */
  async getCategorySpending(year, month) {
    try {
      console.log(`Запрашиваем транзакции за ${month}.${year}`);
      
      // Получаем все транзакции за указанный период
      const queryParams = new URLSearchParams();
      queryParams.append('year', year);
      queryParams.append('month', month);
      queryParams.append('size', 1000); // Берем большое количество для получения всех транзакций
      queryParams.append('page', 0);
      
      const response = await transactionApiService.request(`/transactions?${queryParams.toString()}`);
      
      console.log('Ответ транзакций:', response);
      
      // Проверяем формат ответа
      let transactions = [];
      if (response && response.content) {
        transactions = response.content;
      } else if (Array.isArray(response)) {
        transactions = response;
      } else {
        console.warn('Неожиданный формат ответа транзакций:', response);
        transactions = [];
      }
      
      // Группируем транзакции по категориям и суммируем расходы
      const spendingByCategory = {};
      
      transactions.forEach(transaction => {
        // Проверяем, что транзакция расход (отрицательная сумма)
        const amount = transaction.amount || 0;
        if (amount != 0) {
          const categoryId = transaction.categoryId || transaction.category?.id;
          const absoluteAmount = Math.abs(amount);
          
          if (categoryId) {
            if (!spendingByCategory[categoryId]) {
              spendingByCategory[categoryId] = 0;
            }
            spendingByCategory[categoryId] += absoluteAmount;
          }
        }
      });
      
      // Преобразуем в массив объектов
      const result = Object.keys(spendingByCategory).map(categoryId => ({
        id: parseInt(categoryId),
        spent: spendingByCategory[categoryId]
      }));
      
      console.log('Расходы по категориям:', result);
      return result;
    } catch (error) {
      console.error('Ошибка получения трат по категориям из транзакций:', error);
      
      // Возвращаем тестовые данные в случае ошибки
      return [
        { categoryId: 1, spent: 1250.50, categoryName: "Транспорт" },
        { categoryId: 3, spent: 4300.75, categoryName: "Продукты" },
        { categoryId: 4, spent: 1200.00, categoryName: "Рестораны" },
        { categoryId: 5, spent: 2500.00, categoryName: "Развлечения" },
        { categoryId: 6, spent: 5000.00, categoryName: "Одежда" },
        { categoryId: 7, spent: 1500.00, categoryName: "Здоровье" },
        { categoryId: 8, spent: 3000.00, categoryName: "Образование" },
        { categoryId: 9, spent: 10000.00, categoryName: "Путешествия" },
        { categoryId: 10, spent: 8000.00, categoryName: "Коммунальные услуги" },
        { categoryId: 11, spent: 20000.00, categoryName: "Техника" },
        { categoryId: 12, spent: 3000.00, categoryName: "Подарки" }
      ].filter(cat => cat.spent > 0);
    }
  }

  /**
   * Получение общей статистики по транзакциям
   */
  async getTransactionStatistics(year, month) {
    try {
      const spendingData = await this.getCategorySpending(year, month);
      
      const totalSpent = spendingData.reduce((sum, cat) => sum + cat.spent, 0);
      const transactionCount = spendingData.reduce((sum, cat) => sum + (cat.transactionCount || 1), 0);
      const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;
      
      return {
        totalSpent: totalSpent,
        transactionCount: transactionCount,
        averageTransaction: averageTransaction,
        categoriesCount: spendingData.length
      };
    } catch (error) {
      console.error('Ошибка получения статистики транзакций:', error);
      return {
        totalSpent: 15000,
        transactionCount: 23,
        averageTransaction: 652,
        categoriesCount: 8
      };
    }
  }

  /**
   * Получение детальной статистики по категориям
   */
  async getDetailedCategoryStats(year, month) {
    try {
      const budget = await this.getBudget(year, month);
      const spendingData = await this.getCategorySpending(year, month);
      
      if (!budget || !budget.limits) {
        return [];
      }
      
      // Получаем информацию о категориях
      const categoriesResponse = await budgetApiService.request('/categories');
      const categoriesList = categoriesResponse.content || [];
      
      return budget.limits.map(limit => {
        const categoryInfo = categoriesList.find(c => c.id === limit.category_id);
        const categorySpending = spendingData.find(s => s.categoryId === limit.category_id);
        
        let limitValue = 0;
        if (limit.limit_type === 'PERCENT') {
          limitValue = (budget.total_income * limit.limit_value) / 100;
        } else {
          limitValue = limit.limit_value;
        }
        
        const spent = categorySpending?.spent || 0;
        const available = Math.max(limitValue - spent, 0);
        const progress = limitValue > 0 ? Math.min((spent / limitValue) * 100, 100) : 0;
        
        return {
          id: limit.category_id,
          name: categoryInfo?.name || `Категория ${limit.category_id}`,
          limit: limitValue,
          limitPercentage: limit.limit_type === 'PERCENT' ? limit.limit_value : null,
          spent: spent,
          available: available,
          progress: Math.round(progress),
          remainingDays: this.calculateRemainingDays(year, month),
          dailyBudget: available / this.calculateRemainingDays(year, month)
        };
      });
    } catch (error) {
      console.error('Ошибка получения детальной статистики:', error);
      return [];
    }
  }

  /**
   * Расчет оставшихся дней в месяце
   */
  calculateRemainingDays(year, month) {
    const now = new Date();
    const targetDate = new Date(year, month - 1, 1);
    
    // Если месяц в будущем, возвращаем полное количество дней
    if (targetDate > now) {
      return new Date(year, month, 0).getDate();
    }
    
    // Если текущий месяц
    if (year === now.getFullYear() && month === now.getMonth() + 1) {
      const lastDay = new Date(year, month, 0).getDate();
      return Math.max(lastDay - now.getDate(), 1);
    }
    
    // Если месяц в прошлом
    return 0;
  }

  /**
   * Дефолтная сводка бюджета
   */
  getDefaultBudgetSummary(year, month) {
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                       'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const monthName = monthNames[month - 1] || 'Текущий месяц';
      
    const savedBalance = parseFloat(localStorage.getItem('budgetLimit') || 0);
    const savedExpenseLimit = parseFloat(localStorage.getItem('budgetExpenseLimit') || 0);

    return {
      title: localStorage.getItem('budgetName') || 'Мой бюджет',
      balance: savedBalance,
      period: `${monthName} ${year}`,
      income: savedBalance,
      expenseLimit: savedExpenseLimit,
      freeMoney: Math.max(savedBalance - savedExpenseLimit, 0),
      totalSpent: 0
    };
  }

  /**
   * Удаление бюджета на период
   */
  async deleteBudget(year, month) {
    return await budgetApiService.request(`/budgets/${year}/${month}`, {
      method: 'DELETE',
    });
  }

  /**
   * Создание простого бюджета с процентным распределением
   */
  async createSimpleBudget(year, month, totalIncome, categories) {
    const limits = categories.map(category => ({
      categoryId: category.categoryId,
      limitValue: category.percentage,
      limitType: 'PERCENT'
    }));

    const budgetData = {
      year,
      month,
      totalIncome,
      limits
    };

    return await this.createOrUpdateBudget(budgetData);
  }

  /**
   * Добавление категории в бюджет
   */
  async addCategoryToBudget(data) {
    return await budgetApiService.request('/budget/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Получение текущего бюджета (текущий месяц и год)
   */
  async getCurrentBudget() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    try {
      return await this.getBudget(currentYear, currentMonth);
    } catch (error) {
      console.error('Ошибка получения текущего бюджета:', error);
      
      const savedYear = localStorage.getItem('budgetYear');
      const savedMonth = localStorage.getItem('budgetMonth');
      
      if (savedYear && savedMonth) {
        try {
          return await this.getBudget(parseInt(savedYear), parseInt(savedMonth));
        } catch (secondError) {
          console.error('Ошибка получения сохраненного бюджета:', secondError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Получение всех категорий с бюджетной информацией
   */
  async getCategoriesWithBudgetInfo(year, month) {
    try {
      // Получаем категории
      const categoriesResponse = await budgetApiService.request('/categories');
      const categories = categoriesResponse.content || [];
      
      // Получаем бюджет
      const budget = await this.getBudget(year, month);
      const budgetLimits = budget?.limits || [];
      
      // Получаем траты по категориям
      const spendingData = await this.getCategorySpending(year, month);
      
      return categories.map(category => {
        const limitInfo = budgetLimits.find(limit => limit.category_id === category.id);
        const spendingInfo = spendingData.find(s => s.categoryId === category.id);
        
        return {
          id: category.id,
          name: category.name,
          isInBudget: !!limitInfo,
          limit: limitInfo?.limit_value || 0,
          limitType: limitInfo?.limit_type || 'PERCENT',
          spent: spendingInfo?.spent || 0,
          available: (limitInfo?.limit_value || 0) - (spendingInfo?.spent || 0)
        };
      });
    } catch (error) {
      console.error('Ошибка получения категорий с бюджетной информацией:', error);
      return [];
    }
  }
}

export const budgetService = new BudgetService();