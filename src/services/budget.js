export class Budget {
  constructor(year, month, total_income, limits = []) {
    this.year = year;
    this.month = month;
    this.total_income = total_income;
    this.limits = limits;
  }

  static createFromPercentageDistribution(year, month, totalIncome, categories) {
    const limits = categories.map(category => ({
      category_id: category.categoryId,
      limit_value: category.percentage,
      limit_type: 'PERCENT'
    }));

    return new Budget(year, month, totalIncome, limits);
  }

  validate() {
    const errors = [];

    if (!this.year || this.year < 2000 || this.year > 2100) {
      errors.push('Year must be between 2000 and 2100');
    }

    if (!this.month || this.month < 1 || this.month > 12) {
      errors.push('Month must be between 1 and 12');
    }

    if (!this.total_income || this.total_income <= 0) {
      errors.push('Total income must be positive');
    }

    const percentLimits = this.limits.filter(limit => limit.limit_type === 'PERCENT');
    if (percentLimits.length > 0) {
      const totalPercent = percentLimits.reduce((sum, limit) => sum + limit.limit_value, 0);
      if (Math.abs(totalPercent - 100) > 0.01) {
        errors.push(`Total PERCENT limits must equal 100%. Current: ${totalPercent}%`);
      }
    }

    return errors;
  }

  isValid() {
    return this.validate().length === 0;
  }

  toJSON() {
    return {
      year: this.year,
      month: this.month,
      total_income: this.total_income,
      limits: this.limits
    };
  }
}