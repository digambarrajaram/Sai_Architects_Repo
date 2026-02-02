/**
 * CivManager - Expense Service
 * Mock data and async simulation for expenses
 * NO backend logic - frontend only
 */

import { Expense, ExpenseCategory } from '../types';

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_EXPENSES: Expense[] = [
  // Project 001 expenses
  {
    id: 'exp-001',
    projectId: 'proj-001',
    amount: 150000,
    description: 'Steel reinforcement bars - 50 tons',
    category: ExpenseCategory.MATERIALS,
    date: '2024-06-15',
    createdBy: 'user-001',
    createdAt: '2024-06-15T10:30:00Z',
    notes: 'Grade Fe500D steel',
  },
  {
    id: 'exp-002',
    projectId: 'proj-001',
    amount: 85000,
    description: 'Concrete mixer rental - 2 weeks',
    category: ExpenseCategory.EQUIPMENT,
    date: '2024-06-10',
    createdBy: 'user-002',
    createdAt: '2024-06-10T09:00:00Z',
  },
  {
    id: 'exp-003',
    projectId: 'proj-001',
    amount: 250000,
    description: 'Labor wages - June first half',
    category: ExpenseCategory.LABOR,
    date: '2024-06-16',
    createdBy: 'user-001',
    createdAt: '2024-06-16T18:00:00Z',
    notes: '45 workers x 15 days',
  },
  {
    id: 'exp-004',
    projectId: 'proj-001',
    amount: 45000,
    description: 'Material transport from warehouse',
    category: ExpenseCategory.TRANSPORT,
    date: '2024-06-12',
    createdBy: 'user-002',
    createdAt: '2024-06-12T14:00:00Z',
  },
  // Project 002 expenses
  {
    id: 'exp-005',
    projectId: 'proj-002',
    amount: 200000,
    description: 'Foundation excavation work',
    category: ExpenseCategory.SUBCONTRACTOR,
    date: '2024-06-08',
    createdBy: 'user-003',
    createdAt: '2024-06-08T11:00:00Z',
    notes: 'ABC Excavators Pvt Ltd',
  },
  {
    id: 'exp-006',
    projectId: 'proj-002',
    amount: 75000,
    description: 'Cement - 500 bags',
    category: ExpenseCategory.MATERIALS,
    date: '2024-06-05',
    createdBy: 'user-003',
    createdAt: '2024-06-05T16:00:00Z',
  },
  {
    id: 'exp-007',
    projectId: 'proj-002',
    amount: 25000,
    description: 'Building permit fees',
    category: ExpenseCategory.PERMITS,
    date: '2024-03-15',
    createdBy: 'user-001',
    createdAt: '2024-03-15T10:00:00Z',
  },
  // Project 005 expenses
  {
    id: 'exp-008',
    projectId: 'proj-005',
    amount: 500000,
    description: 'Tunnel boring machine rental',
    category: ExpenseCategory.EQUIPMENT,
    date: '2024-06-18',
    createdBy: 'user-004',
    createdAt: '2024-06-18T08:00:00Z',
  },
  {
    id: 'exp-009',
    projectId: 'proj-005',
    amount: 350000,
    description: 'Electrical installation - Phase 1',
    category: ExpenseCategory.SUBCONTRACTOR,
    date: '2024-06-15',
    createdBy: 'user-004',
    createdAt: '2024-06-15T12:00:00Z',
  },
  {
    id: 'exp-010',
    projectId: 'proj-005',
    amount: 15000,
    description: 'Site electricity bill - May',
    category: ExpenseCategory.UTILITIES,
    date: '2024-06-01',
    createdBy: 'user-005',
    createdAt: '2024-06-01T09:00:00Z',
  },
];

// =====================================================
// ASYNC SIMULATION HELPER
// =====================================================

const simulateDelay = (ms: number = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// =====================================================
// EXPENSE SERVICE
// =====================================================

export const expenseService = {
  /**
   * Get all expenses for a project
   */
  async getExpensesByProject(projectId: string): Promise<Expense[]> {
    await simulateDelay(600);
    return MOCK_EXPENSES.filter(e => e.projectId === projectId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },

  /**
   * Get expense by ID
   */
  async getExpenseById(expenseId: string): Promise<Expense> {
    await simulateDelay(300);
    const expense = MOCK_EXPENSES.find(e => e.id === expenseId);
    if (!expense) {
      throw new Error(`Expense not found: ${expenseId}`);
    }
    return { ...expense };
  },

  /**
   * Get expenses by category for a project
   */
  async getExpensesByCategory(
    projectId: string,
    category: ExpenseCategory
  ): Promise<Expense[]> {
    await simulateDelay(400);
    return MOCK_EXPENSES.filter(
      e => e.projectId === projectId && e.category === category
    );
  },

  /**
   * Get expenses within a date range
   */
  async getExpensesByDateRange(
    projectId: string,
    startDate: string,
    endDate: string
  ): Promise<Expense[]> {
    await simulateDelay(500);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return MOCK_EXPENSES.filter(e => {
      const expenseDate = new Date(e.date).getTime();
      return (
        e.projectId === projectId &&
        expenseDate >= start &&
        expenseDate <= end
      );
    });
  },

  /**
   * Create a new expense
   */
  async createExpense(
    expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'> & { projectId: string }
  ): Promise<Expense> {
    await simulateDelay(600);
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdBy: 'current-user', // Would come from auth context in real app
      createdAt: new Date().toISOString(),
    };
    MOCK_EXPENSES.unshift(newExpense);
    return newExpense;
  },

  /**
   * Update an expense
   */
  async updateExpense(
    expenseId: string,
    updates: Partial<Expense>
  ): Promise<Expense> {
    await simulateDelay(500);
    const index = MOCK_EXPENSES.findIndex(e => e.id === expenseId);
    if (index === -1) {
      throw new Error(`Expense not found: ${expenseId}`);
    }
    MOCK_EXPENSES[index] = {
      ...MOCK_EXPENSES[index],
      ...updates,
    };
    return { ...MOCK_EXPENSES[index] };
  },

  /**
   * Delete an expense
   */
  async deleteExpense(expenseId: string): Promise<void> {
    await simulateDelay(400);
    const index = MOCK_EXPENSES.findIndex(e => e.id === expenseId);
    if (index === -1) {
      throw new Error(`Expense not found: ${expenseId}`);
    }
    MOCK_EXPENSES.splice(index, 1);
  },

  /**
   * Get expense summary by category for a project
   */
  async getExpenseSummaryByCategory(
    projectId: string
  ): Promise<Array<{ category: ExpenseCategory; total: number; count: number }>> {
    await simulateDelay(400);
    const projectExpenses = MOCK_EXPENSES.filter(e => e.projectId === projectId);
    
    const summary = Object.values(ExpenseCategory).map(category => {
      const categoryExpenses = projectExpenses.filter(e => e.category === category);
      return {
        category,
        total: categoryExpenses.reduce((sum, e) => sum + e.amount, 0),
        count: categoryExpenses.length,
      };
    });

    return summary.filter(s => s.count > 0);
  },

  /**
   * Get total expenses for a project
   */
  async getTotalExpenses(projectId: string): Promise<number> {
    await simulateDelay(200);
    return MOCK_EXPENSES
      .filter(e => e.projectId === projectId)
      .reduce((sum, e) => sum + e.amount, 0);
  },
};

export default expenseService;
