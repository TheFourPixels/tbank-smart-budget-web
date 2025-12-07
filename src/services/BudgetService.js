import { budgetApiService } from './ApiService.js';

class BudgetService {

   /**
   * Получение сводной информации по бюджету
   * @param {number} year - Год
   * @param {number} month - Месяц
   * @returns {Promise<Object>}
   */
  async getBudgetSummary(year, month) {
    const budgetData = await this.getBudget(year, month);
    
    // Рассчитываем общую сумму лимитов
    const totalLimits = budgetData.limits.reduce((sum, limit) => {
      if (limit.limit_type === 'PERCENT') {
        return sum + (budgetData.total_income * limit.limit_value / 100);
      }
      return sum + (limit.limit_value || 0);
    }, 0);
    
    // Рассчитываем свободные средства
    const freeMoney = budgetData.total_income - totalLimits;
    
    return {
      title: `Бюджет на ${this.getMonthName(month)} ${year}`,
      balance: budgetData.total_income,
      period: `${this.getMonthName(month)} ${year}`,
      income: budgetData.total_income,
      expenseLimit: totalLimits,
      freeMoney: freeMoney > 0 ? freeMoney : 0,
      rawData: budgetData
    };
  }

  /**
   * Получение названия месяца
   * @param {number} month - Номер месяца (1-12)
   * @returns {string}
   */
  getMonthName(month) {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month - 1] || '';
  }

  /**
   * Получение статистики по категориям
   * @param {number} year - Год
   * @param {number} month - Месяц
   * @returns {Promise<Array>}
   */
  async getCategoryStats(year, month) {
    try {
      const budgetData = await this.getBudget(year, month);
      const categories = await categoryService.getCategories();
      
      // Здесь можно добавить логику получения реальных транзакций
      // и расчета потраченных сумм по категориям
      // Пока используем моковые данные
      
      return categories.map(category => {
        const categoryLimit = budgetData.limits.find(limit => 
          limit.category_id === category.id
        );
        
        // Моковые данные трат - в реальном приложении нужно получать из транзакций
        const mockSpent = categoryLimit 
          ? Math.floor(categoryLimit.limit_value * (Math.random() * 0.8 + 0.2))
          : 0;
        
        const limitValue = categoryLimit?.limit_value || 0;
        const progress = limitValue > 0 ? Math.min((mockSpent / limitValue) * 100, 100) : 0;
        
        return {
          id: category.id,
          icon: this.getCategoryIcon(category.name),
          title: category.name,
          progress: Math.round(progress),
          spent: mockSpent,
          limit: limitValue,
          available: limitValue - mockSpent,
          rawCategory: category
        };
      });
    } catch (error) {
      console.error('Ошибка получения статистики категорий:', error);
      return [];
    }
  }

  /**
   * Получение иконки для категории
   * @param {string} categoryName - Название категории
   * @returns {string}
   */
  getCategoryIcon(categoryName) {
    const iconMap = {
      'продукты': '🍎',
      'еда': '🍔',
      'транспорт': '🚗',
      'маркетплейсы': '🛒',
      'развлечения': '🎬',
      'образование': '📚',
      'здоровье': '💊',
      'дом': '🏠',
      'одежда': '👕',
      'красота': '💄',
      'спорт': '⚽',
      'подарки': '🎁',
      'путешествия': '✈️',
      'связь': '📱',
      'интернет': '🌐',
      'коммунальные': '💡',
      'кредиты': '🏦',
      'накопления': '💰',
      'другое': '📦'
    };

    const lowerName = categoryName.toLowerCase();
    for (const [key, icon] of Object.entries(iconMap)) {
      if (lowerName.includes(key)) {
        return icon;
      }
    }
    
    // Дефолтная иконка
    const defaultIcons = ['🍎', '💰', '📊', '📈', '📉', '💳'];
    return defaultIcons[Math.floor(Math.random() * defaultIcons.length)];
  }
  
  /**
   * Создание или обновление бюджета на период
   * @param {Object} budgetData - Данные бюджета
   * @param {number} budgetData.year - Год
   * @param {number} budgetData.month - Месяц
   * @param {number} budgetData.totalIncome - Общий доход
   * @param {Array} budgetData.limits - Лимиты по категориям
   * @returns {Promise<Object>}
   */
  async createOrUpdateBudget(budgetData) {
    const apiData = {
      year: budgetData.year,
      month: budgetData.month,
      totalIncome: budgetData.totalIncome,
      limits: budgetData.limits.map(limit => ({
        categoryId: limit.categoryId,
        limitValue: limit.limitValue,
        limitType: limit.limitType || 'ABSOLUTE'
      }))
    };

    return await budgetApiService.request('/budgets', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  /**
   * Получение бюджета на период
   * @param {number} year - Год
   * @param {number} month - Месяц
   * @returns {Promise<Object>}
   */
  async getBudget(year, month) {
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
  }

  /**
   * Удаление бюджета на период
   * @param {number} year - Год
   * @param {number} month - Месяц
   * @returns {Promise<void>}
   */
  async deleteBudget(year, month) {
    return await budgetApiService.request(`/budgets/${year}/${month}`, {
      method: 'DELETE',
    });
  }

  /**
   * Расчет суммы распределения по категориям
   * @param {Array} limits - Лимиты по категориям
   * @returns {number} Сумма всех лимитов
   */
  calculateTotalLimits(limits) {
    return limits.reduce((total, limit) => total + (limit.limitValue || 0), 0);
  }
}

export const budgetService = new BudgetService();