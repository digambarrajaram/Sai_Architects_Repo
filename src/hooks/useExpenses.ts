// src/hooks/useExpenses.ts
import { useState, useCallback } from 'react';
import { expenseService, BackendExpense, DateRangeFilter } from '../services/expenseService';
import { useAsyncState } from './useAsyncState';

interface UseExpensesOptions {
  projectId: string;
  autoLoad?: boolean;
}

export function useExpenses({ projectId, autoLoad = true }: UseExpensesOptions) {
  const [dateRange, setDateRange] = useState<DateRangeFilter>({});

  const {
    data: expenses,
    loading,
    error,
    execute: loadExpenses,
    setData: setExpenses,
  } = useAsyncState<BackendExpense[]>({
    initialData: [],
  });

  const fetchExpenses = useCallback(async () => {
    return loadExpenses(() => 
      expenseService.getExpensesByProject(projectId, dateRange)
    );
  }, [projectId, dateRange, loadExpenses]);

  const addExpense = useCallback(async (expenseData: any) => {
    try {
      const newExpense = await expenseService.createExpenseDirect(expenseData);
      const currentExpenses = expenses || [];
      setExpenses([newExpense, ...currentExpenses]);
      return newExpense;
    } catch (error) {
      throw error;
    }
  }, [setExpenses, expenses]);

  const updateExpense = useCallback(async (expenseId: string, updates: any) => {
    try {
      const updated = await expenseService.updateExpense(expenseId, updates);
      const currentExpenses = expenses || [];
      setExpenses(currentExpenses.map((exp: BackendExpense) => exp.id === expenseId ? updated : exp));
      return updated;
    } catch (error) {
      throw error;
    }
  }, [setExpenses, expenses]);

  const deleteExpense = useCallback(async (expenseId: string) => {
    try {
      await expenseService.deleteExpense(expenseId);
      const currentExpenses = expenses || [];
      setExpenses(currentExpenses.filter((exp: BackendExpense) => exp.id !== expenseId));
    } catch (error) {
      throw error;
    }
  }, [setExpenses, expenses]);

  const getTotal = useCallback(() => {
    return (expenses || []).reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const getByCategory = useCallback(() => {
    const summary: Record<string, { total: number; count: number }> = {};
    (expenses || []).forEach(exp => {
      if (!summary[exp.category]) {
        summary[exp.category] = { total: 0, count: 0 };
      }
      summary[exp.category].total += exp.amount;
      summary[exp.category].count += 1;
    });
    return summary;
  }, [expenses]);

  return {
    expenses: expenses || [],
    loading,
    error,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getTotal,
    getByCategory,
    setDateRange,
  };
}
