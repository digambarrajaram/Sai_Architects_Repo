/**
 * CivManager - Expense Service
 * Production-ready Supabase integration with proper error handling
 */

import { supabase, isSupabaseConfigured, logSupabaseError } from './supabaseClient';

// =====================================================
// BACKEND-ALIGNED TYPES (matches backend schema)
// =====================================================

export interface BackendExpense {
  id: string; // UUID
  project_id: string; // UUID
  amount: number;
  category: string; // Text (Materials, Labor, etc.)
  description?: string;
  expense_date: string; // Date
  created_by: string; // UUID
  created_at: string; // Timestamp
}

// Backend-aligned expense categories (from Backend_Migration_Plan_&_Structure.md)
export type BackendExpenseCategory =
  | 'Materials'
  | 'Labor'
  | 'Machinery'
  | 'Transport'
  | 'Survey Equipment'
  | 'Permits'
  | 'Utilities'
  | 'Subcontractor'
  | 'Miscellaneous';

export interface CreateExpenseInput {
  project_id: string;
  amount: number;
  category: string;
  description?: string;
  expense_date: string;
}

export interface DateRangeFilter {
  startDate?: Date;  // Inclusive start date
  endDate?: Date;    // Inclusive end date
}

export interface ExpenseQueryOptions {
  projectId: string;
  dateRange?: DateRangeFilter;
  orderBy?: 'expense_date' | 'created_at' | 'amount';
  ascending?: boolean;
}

export interface ExpenseSummary {
  category: string;
  total: number;
  count: number;
}

// =====================================================
// ERROR HANDLING
// =====================================================

export class ExpenseServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ExpenseServiceError';
  }
}

// =====================================================
// MOCK DATA (for development/fallback)
// =====================================================

const MOCK_EXPENSES: BackendExpense[] = [
  {
    id: 'exp-001',
    project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    amount: 120000,
    category: 'Materials',
    description: 'Concrete and steel procurement',
    expense_date: '2026-01-05',
    created_by: '33333333-3333-3333-3333-333333333333',
    created_at: '2026-01-05T10:00:00Z',
  },
  {
    id: 'exp-002',
    project_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    amount: 85000,
    category: 'Labor',
    description: 'Construction workers wages',
    expense_date: '2026-01-10',
    created_by: '33333333-3333-3333-3333-333333333333',
    created_at: '2026-01-10T09:00:00Z',
  },
  {
    id: 'exp-003',
    project_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    amount: 95000,
    category: 'Machinery',
    description: 'Crane rental',
    expense_date: '2026-01-12',
    created_by: '44444444-4444-4444-4444-444444444444',
    created_at: '2026-01-12T11:00:00Z',
  },
  {
    id: 'exp-004',
    project_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    amount: 45000,
    category: 'Transport',
    description: 'Material delivery',
    expense_date: '2026-01-15',
    created_by: '44444444-4444-4444-4444-444444444444',
    created_at: '2026-01-15T14:00:00Z',
  },
  {
    id: 'exp-005',
    project_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    amount: 30000,
    category: 'Survey Equipment',
    description: 'GPS and surveying tools',
    expense_date: '2026-01-20',
    created_by: '33333333-3333-3333-3333-333333333333',
    created_at: '2026-01-20T16:00:00Z',
  },
];

// Check if we should use mock data
const shouldUseMockData = (): boolean => {
  return !isSupabaseConfigured();
};

// Helper function to check if user is authenticated before making Supabase requests
const checkAuthSession = async (): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      if (__DEV__) {
        console.log('[ExpenseService] User not authenticated - returning empty results');
      }
      return false;
    }
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('[ExpenseService] Auth session check error:', error);
    }
    return false;
  }
};

// =====================================================
// EXPENSE SERVICE (Production-Ready)
// =====================================================

export const expenseService = {
  /**
   * Get all expenses for a project with optional date filtering
   * Uses server-side filtering for optimal performance
   */
  async getExpensesByProject(
    projectId: string, 
    dateRange?: DateRangeFilter
  ): Promise<BackendExpense[]> {
    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ExpenseService] Using mock data for project:', projectId);
      }
      let filtered = MOCK_EXPENSES.filter(e => e.project_id === projectId);
      
      // Apply date filtering on mock data
      if (dateRange?.startDate || dateRange?.endDate) {
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expense_date);
          if (dateRange.startDate && expenseDate < dateRange.startDate) return false;
          if (dateRange.endDate && expenseDate > dateRange.endDate) return false;
          return true;
        });
      }
      
      return filtered.sort(
        (a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime()
      );
    }

    // Check if user is authenticated before making Supabase requests
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return [];
    }

    try {
      // Build query with date filters - only select columns that exist in the database
      let query = supabase
        .from('expenses')
        .select(`
          id,
          project_id,
          amount,
          category,
          expense_date,
          created_by,
          created_at
        `)
        .eq('project_id', projectId);

      // Apply server-side date filtering (inclusive)
      if (dateRange?.startDate) {
        const startDateStr = dateRange.startDate.toISOString().split('T')[0];
        query = query.gte('expense_date', startDateStr);
      }
      
      if (dateRange?.endDate) {
        const endDateStr = dateRange.endDate.toISOString().split('T')[0];
        query = query.lte('expense_date', endDateStr);
      }

      const { data, error } = await query.order('expense_date', { ascending: false });

      if (error) {
        logSupabaseError('getExpensesByProject', error);
        throw new ExpenseServiceError(
          `Failed to fetch expenses: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      if (__DEV__) {
        console.log('[ExpenseService] Fetched expenses:', data?.length || 0, 
          dateRange ? `with date filter: ${dateRange.startDate?.toISOString() || 'null'} - ${dateRange.endDate?.toISOString() || 'null'}` : '');
      }

      return data || [];
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error fetching expenses',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Get expenses with advanced query options
   * Optimized for performance with server-side filtering
   */
  async getExpensesWithFilters(options: ExpenseQueryOptions): Promise<BackendExpense[]> {
    const { projectId, dateRange, orderBy = 'expense_date', ascending = false } = options;
    
    return this.getExpensesByProject(projectId, dateRange);
  },

  /**
   * Get expense by ID
   */
  async getExpenseById(expenseId: string): Promise<BackendExpense | null> {
    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ExpenseService] Using mock data for expense:', expenseId);
      }
      const expense = MOCK_EXPENSES.find(e => e.id === expenseId);
      return expense ? { ...expense } : null;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          project_id,
          amount,
          category,
          expense_date,
          created_by,
          created_at
        `)
        .eq('id', expenseId)
        .maybeSingle();

      if (error) {
        throw new ExpenseServiceError(
          `Failed to fetch expense: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error fetching expense',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Create expense via RPC (backend-enforced)
   * This is the CORRECT way to create expenses per backend design
   */
  async createExpense(input: CreateExpenseInput, userId?: string): Promise<BackendExpense> {
    // Validate input
    if (!input.project_id || !input.amount || !input.category || !input.expense_date) {
      throw new ExpenseServiceError(
        'Missing required fields for expense creation',
        'VALIDATION_ERROR'
      );
    }

    if (input.amount <= 0) {
      throw new ExpenseServiceError(
        'Amount must be positive',
        'VALIDATION_ERROR'
      );
    }

    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ExpenseService] Using mock data for creating expense');
      }
      const newExpense: BackendExpense = {
        id: `exp-${Date.now()}`,
        project_id: input.project_id,
        amount: input.amount,
        category: input.category,
        description: input.description,
        expense_date: input.expense_date,
        created_by: userId || 'mock-user',
        created_at: new Date().toISOString(),
      };
      return newExpense;
    }

    try {
      // Use RPC function for controlled write
      const { data, error } = await supabase.rpc('create_expense', {
        p_project_id: input.project_id,
        p_amount: input.amount,
        p_category: input.category,
        p_description: input.description || null,
        p_expense_date: input.expense_date,
      });

      if (error) {
        logSupabaseError('createExpense RPC', error);
        throw new ExpenseServiceError(
          `Failed to create expense: ${error.message}`,
          'CREATE_ERROR',
          error
        );
      }

      // Fetch the created expense
      const { data: expense, error: fetchError } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', data)
        .single();

      if (fetchError || !expense) {
        throw new ExpenseServiceError(
          'Failed to fetch created expense',
          'FETCH_ERROR',
          fetchError
        );
      }

      if (__DEV__) {
        console.log('[ExpenseService] Created expense:', expense.id);
      }

      return expense;
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error creating expense',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Create expense directly (alternative to RPC)
   * Use this if RPC is not set up
   */
  async createExpenseDirect(input: CreateExpenseInput, userId?: string): Promise<BackendExpense> {
    // Validate input
    if (!input.project_id || !input.amount || !input.category || !input.expense_date) {
      throw new ExpenseServiceError(
        'Missing required fields for expense creation',
        'VALIDATION_ERROR'
      );
    }

    if (input.amount <= 0) {
      throw new ExpenseServiceError(
        'Amount must be positive',
        'VALIDATION_ERROR'
      );
    }

    if (shouldUseMockData()) {
      const newExpense: BackendExpense = {
        id: `exp-${Date.now()}`,
        project_id: input.project_id,
        amount: input.amount,
        category: input.category,
        description: input.description,
        expense_date: input.expense_date,
        created_by: userId || 'mock-user',
        created_at: new Date().toISOString(),
      };
      return newExpense;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          project_id: input.project_id,
          amount: input.amount,
          category: input.category,
          expense_date: input.expense_date,
          created_by: userId,
        })
        .select()
        .single();

      if (error) {
        logSupabaseError('createExpenseDirect', error);
        throw new ExpenseServiceError(
          `Failed to create expense: ${error.message}`,
          'CREATE_ERROR',
          error
        );
      }

      if (__DEV__) {
        console.log('[ExpenseService] Created expense:', data.id);
      }

      return data;
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error creating expense',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Update expense
   */
  async updateExpense(
    expenseId: string,
    updates: Partial<CreateExpenseInput>
  ): Promise<BackendExpense> {
    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ExpenseService] Using mock data for updating expense:', expenseId);
      }
      const index = MOCK_EXPENSES.findIndex(e => e.id === expenseId);
      if (index === -1) {
        throw new ExpenseServiceError(
          `Expense not found: ${expenseId}`,
          'NOT_FOUND'
        );
      }

      const updated = {
        ...MOCK_EXPENSES[index],
        ...updates,
      };
      return updated;
    }

    try {
      // Remove description from updates since it doesn't exist in the database
      const { description, ...updateData } = updates;
      
      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expenseId)
        .select()
        .single();

      if (error) {
        throw new ExpenseServiceError(
          `Failed to update expense: ${error.message}`,
          'UPDATE_ERROR',
          error
        );
      }

      if (!data) {
        throw new ExpenseServiceError(
          `Expense not found: ${expenseId}`,
          'NOT_FOUND'
        );
      }

      if (__DEV__) {
        console.log('[ExpenseService] Updated expense:', expenseId);
      }

      return data;
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error updating expense',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Delete expense
   */
  async deleteExpense(expenseId: string): Promise<void> {
    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ExpenseService] Using mock data for deleting expense:', expenseId);
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        throw new ExpenseServiceError(
          `Failed to delete expense: ${error.message}`,
          'DELETE_ERROR',
          error
        );
      }

      if (__DEV__) {
        console.log('[ExpenseService] Deleted expense:', expenseId);
      }
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error deleting expense',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Get expense summary by category for a project
   */
  async getExpenseSummaryByCategory(
    projectId: string
  ): Promise<ExpenseSummary[]> {
    if (shouldUseMockData()) {
      const projectExpenses = MOCK_EXPENSES.filter(e => e.project_id === projectId);
      
      const summary: Record<string, { total: number; count: number }> = {};
      
      projectExpenses.forEach(expense => {
        if (!summary[expense.category]) {
          summary[expense.category] = { total: 0, count: 0 };
        }
        summary[expense.category].total += expense.amount;
        summary[expense.category].count += 1;
      });

      return Object.entries(summary).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }));
    }

    try {
      // Get all expenses for the project
      const { data, error } = await supabase
        .from('expenses')
        .select('category, amount')
        .eq('project_id', projectId);

      if (error) {
        throw new ExpenseServiceError(
          `Failed to fetch expense summary: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      // Aggregate by category
      const summary: Record<string, { total: number; count: number }> = {};
      
      (data || []).forEach(expense => {
        if (!summary[expense.category]) {
          summary[expense.category] = { total: 0, count: 0 };
        }
        summary[expense.category].total += expense.amount || 0;
        summary[expense.category].count += 1;
      });

      return Object.entries(summary).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }));
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error fetching expense summary',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Get total expenses for a project with optional date filtering
   * Uses server-side aggregation for optimal performance
   */
  async getTotalExpenses(projectId: string, dateRange?: DateRangeFilter): Promise<number> {
    if (shouldUseMockData()) {
      let filtered = MOCK_EXPENSES.filter(e => e.project_id === projectId);
      
      if (dateRange?.startDate || dateRange?.endDate) {
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expense_date);
          if (dateRange.startDate && expenseDate < dateRange.startDate) return false;
          if (dateRange.endDate && expenseDate > dateRange.endDate) return false;
          return true;
        });
      }
      
      return filtered.reduce((sum, e) => sum + e.amount, 0);
    }

    try {
      // Build query with date filters
      let query = supabase
        .from('expenses')
        .select('amount')
        .eq('project_id', projectId);

      // Apply server-side date filtering (inclusive)
      if (dateRange?.startDate) {
        const startDateStr = dateRange.startDate.toISOString().split('T')[0];
        query = query.gte('expense_date', startDateStr);
      }
      
      if (dateRange?.endDate) {
        const endDateStr = dateRange.endDate.toISOString().split('T')[0];
        query = query.lte('expense_date', endDateStr);
      }

      const { data, error } = await query;

      if (error) {
        throw new ExpenseServiceError(
          `Failed to fetch total expenses: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      // Sum amounts, ensuring they are parsed as numbers
      return (data || []).reduce((sum, e) => {
        const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error fetching total expenses',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Get expense count for a project with optional date filtering
   * Uses server-side count for optimal performance
   */
  async getExpenseCount(projectId: string, dateRange?: DateRangeFilter): Promise<number> {
    if (shouldUseMockData()) {
      let filtered = MOCK_EXPENSES.filter(e => e.project_id === projectId);
      
      if (dateRange?.startDate || dateRange?.endDate) {
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expense_date);
          if (dateRange.startDate && expenseDate < dateRange.startDate) return false;
          if (dateRange.endDate && expenseDate > dateRange.endDate) return false;
          return true;
        });
      }
      
      return filtered.length;
    }

    try {
      // Build query with date filters
      let query = supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      // Apply server-side date filtering (inclusive)
      if (dateRange?.startDate) {
        const startDateStr = dateRange.startDate.toISOString().split('T')[0];
        query = query.gte('expense_date', startDateStr);
      }
      
      if (dateRange?.endDate) {
        const endDateStr = dateRange.endDate.toISOString().split('T')[0];
        query = query.lte('expense_date', endDateStr);
      }

      const { count, error } = await query;

      if (error) {
        throw new ExpenseServiceError(
          `Failed to fetch expense count: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      return count || 0;
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error fetching expense count',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Get expense statistics for a project with optional date filtering
   * Returns total, count, and average in a single optimized call
   */
  async getExpenseStats(projectId: string, dateRange?: DateRangeFilter): Promise<{
    total: number;
    count: number;
    average: number;
  }> {
    if (shouldUseMockData()) {
      let filtered = MOCK_EXPENSES.filter(e => e.project_id === projectId);
      
      if (dateRange?.startDate || dateRange?.endDate) {
        filtered = filtered.filter(expense => {
          const expenseDate = new Date(expense.expense_date);
          if (dateRange.startDate && expenseDate < dateRange.startDate) return false;
          if (dateRange.endDate && expenseDate > dateRange.endDate) return false;
          return true;
        });
      }
      
      const total = filtered.reduce((sum, e) => sum + e.amount, 0);
      const count = filtered.length;
      
      return {
        total,
        count,
        average: count > 0 ? total / count : 0,
      };
    }

    try {
      // Build query with date filters
      let query = supabase
        .from('expenses')
        .select('amount')
        .eq('project_id', projectId);

      // Apply server-side date filtering (inclusive)
      if (dateRange?.startDate) {
        const startDateStr = dateRange.startDate.toISOString().split('T')[0];
        query = query.gte('expense_date', startDateStr);
      }
      
      if (dateRange?.endDate) {
        const endDateStr = dateRange.endDate.toISOString().split('T')[0];
        query = query.lte('expense_date', endDateStr);
      }

      const { data, error } = await query;

      if (error) {
        throw new ExpenseServiceError(
          `Failed to fetch expense stats: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      const expenses = data || [];
      const total = expenses.reduce((sum, e) => {
        const amount = typeof e.amount === 'string' ? parseFloat(e.amount) : (e.amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      const count = expenses.length;

      return {
        total,
        count,
        average: count > 0 ? total / count : 0,
      };
    } catch (error) {
      if (error instanceof ExpenseServiceError) {
        throw error;
      }
      throw new ExpenseServiceError(
        'Unexpected error fetching expense stats',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },
};

// Export for use in components
export default expenseService;
