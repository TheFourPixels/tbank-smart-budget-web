import { useState, useCallback } from 'react';
import { goalService } from '../services/goalService';

export const useGoals = () => {
  const [goals, setGoals] = useState({ completed: [], active: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setAuthToken = useCallback((token) => {
    goalService.setAuthToken(token);
  }, []);

  const createGoal = useCallback(async (goalData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await goalService.createGoal(goalData);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGoal = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await goalService.getGoal(id);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGoal = useCallback(async (id, goalData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await goalService.updateGoal(id, goalData);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteGoal = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await goalService.deleteGoal(id);
      return true;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const contributeToGoal = useCallback(async (id, amount) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await goalService.contributeToGoal(id, amount);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGoals = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await goalService.getAllGoals(year, month);
      setGoals(result);
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
    goals,
    loading,
    error,
    setAuthToken,
    createGoal,
    getGoal,
    updateGoal,
    deleteGoal,
    contributeToGoal,
    loadGoals,
    clearError
  };
};
