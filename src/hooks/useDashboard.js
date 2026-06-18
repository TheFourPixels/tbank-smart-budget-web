import { useState, useCallback, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';

export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setAuthToken = useCallback((token) => {
    dashboardService.setAuthToken(token);
  }, []);

  const fetchDashboardData = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await dashboardService.getDashboardData(year, month);
      setDashboardData(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMonthlyReport = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      const report = await dashboardService.getMonthlyReport(year, month);
      return report;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getYearlyReport = useCallback(async (year) => {
    setLoading(true);
    setError(null);
    
    try {
      const report = await dashboardService.getYearlyReport(year);
      return report;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getComparisonData = useCallback(async (year, month) => {
    setLoading(true);
    setError(null);
    
    try {
      const comparison = await dashboardService.getComparisonData(year, month);
      return comparison;
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
    dashboardData,
    loading,
    error,
    setAuthToken,
    fetchDashboardData,
    getMonthlyReport,
    getYearlyReport,
    getComparisonData,
    clearError
  };
};
