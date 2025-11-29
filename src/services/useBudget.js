// hooks/useBudget.js
import { useState, useCallback } from 'react';
import { budgetService } from '../services/budgetService';

export const useBudget = () => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBudget = useCallback(async (year, month, totalIncome, categories) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetService.createPercentageBudget(year, month, totalIncome, categories);
      setBudget(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBudget = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetService.getBudget(year, month);
      setBudget(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentBudget = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await budgetService.getCurrentBudget();
      setBudget(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    budget,
    loading,
    error,
    createBudget,
    getBudget,
    getCurrentBudget,
    clearError
  };
};