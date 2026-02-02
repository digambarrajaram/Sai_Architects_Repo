/**
 * CivManager - Project Context Provider
 * Store: projectId, metadata, totals, permissions
 * Wrap project-dependent screens using this context
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Project,
  ProjectTotals,
  ProjectMetadata,
  ProjectPermissions,
  Expense,
  LoadingState,
} from '../types';
import { useAuth } from './AuthContext';
import { getProjectPermissions } from '../utils/permissions';
import { projectService } from '../services/projectService';
import { expenseService } from '../services/expenseService';

// =====================================================
// CONTEXT TYPES
// =====================================================

interface ProjectContextState {
  // Core data
  projectId: string | null;
  project: Project | null;
  expenses: Expense[];
  
  // Computed data
  totals: ProjectTotals | null;
  metadata: ProjectMetadata | null;
  
  // Permissions (based on user role)
  permissions: ProjectPermissions;
  
  // Loading states
  loadingState: LoadingState;
  expensesLoadingState: LoadingState;
  error: string | null;
}

interface ProjectContextActions {
  // Project actions
  setProjectId: (projectId: string) => void;
  refreshProject: () => Promise<void>;
  clearProject: () => void;
  
  // Expense actions
  refreshExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
}

type ProjectContextType = ProjectContextState & ProjectContextActions;

// =====================================================
// DEFAULT VALUES
// =====================================================

const defaultTotals: ProjectTotals = {
  totalBudget: 0,
  totalExpenses: 0,
  remainingBudget: 0,
  expenseCount: 0,
};

const defaultMetadata: ProjectMetadata = {
  supervisorCount: 0,
  documentCount: 0,
};

const defaultPermissions: ProjectPermissions = {
  canViewBudget: false,
  canEditBudget: false,
  canViewProfitLoss: false,
  canAddExpense: false,
  canEditExpense: false,
  canDeleteExpense: false,
  canViewAuditLogs: false,
  canExportReports: false,
};

const defaultState: ProjectContextState = {
  projectId: null,
  project: null,
  expenses: [],
  totals: null,
  metadata: null,
  permissions: defaultPermissions,
  loadingState: 'idle',
  expensesLoadingState: 'idle',
  error: null,
};

// =====================================================
// CONTEXT CREATION
// =====================================================

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// =====================================================
// PROVIDER COMPONENT
// =====================================================

interface ProjectProviderProps {
  children: ReactNode;
  initialProjectId?: string;
}

export function ProjectProvider({ children, initialProjectId }: ProjectProviderProps) {
  const { role } = useAuth();
  
  // State
  const [projectId, setProjectIdState] = useState<string | null>(initialProjectId || null);
  const [project, setProject] = useState<Project | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totals, setTotals] = useState<ProjectTotals | null>(null);
  const [metadata, setMetadata] = useState<ProjectMetadata | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [expensesLoadingState, setExpensesLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<string | null>(null);

  // Memoized permissions based on role
  const permissions = useMemo(() => getProjectPermissions(role), [role]);

  // =====================================================
  // PROJECT ACTIONS
  // =====================================================

  const setProjectId = useCallback((id: string) => {
    setProjectIdState(id);
    setError(null);
  }, []);

  const clearProject = useCallback(() => {
    setProjectIdState(null);
    setProject(null);
    setExpenses([]);
    setTotals(null);
    setMetadata(null);
    setLoadingState('idle');
    setExpensesLoadingState('idle');
    setError(null);
  }, []);

  const refreshProject = useCallback(async () => {
    if (!projectId) return;

    setLoadingState('loading');
    setError(null);

    try {
      const [projectData, totalsData, metadataData] = await Promise.all([
        projectService.getProjectById(projectId),
        projectService.getProjectTotals(projectId),
        projectService.getProjectMetadata(projectId),
      ]);

      setProject(projectData);
      setTotals(totalsData);
      setMetadata(metadataData);
      setLoadingState('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load project';
      setError(errorMessage);
      setLoadingState('error');
    }
  }, [projectId]);

  // =====================================================
  // EXPENSE ACTIONS
  // =====================================================

  const refreshExpenses = useCallback(async () => {
    if (!projectId) return;

    setExpensesLoadingState('loading');

    try {
      const expensesData = await expenseService.getExpensesByProject(projectId);
      setExpenses(expensesData);
      setExpensesLoadingState('success');
    } catch (err) {
      setExpensesLoadingState('error');
    }
  }, [projectId]);

  const addExpense = useCallback(
    async (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => {
      if (!projectId) throw new Error('No project selected');

      const newExpense = await expenseService.createExpense({
        ...expense,
        projectId,
      });

      setExpenses(prev => [newExpense, ...prev]);
      
      // Update totals
      if (totals) {
        setTotals({
          ...totals,
          totalExpenses: totals.totalExpenses + expense.amount,
          remainingBudget: totals.remainingBudget - expense.amount,
          expenseCount: totals.expenseCount + 1,
        });
      }
    },
    [projectId, totals]
  );

  const updateExpense = useCallback(
    async (expenseId: string, updates: Partial<Expense>) => {
      const updatedExpense = await expenseService.updateExpense(expenseId, updates);

      setExpenses(prev =>
        prev.map(exp => (exp.id === expenseId ? updatedExpense : exp))
      );

      // Refresh totals if amount changed
      if (updates.amount !== undefined) {
        await refreshProject();
      }
    },
    [refreshProject]
  );

  const deleteExpense = useCallback(
    async (expenseId: string) => {
      const expense = expenses.find(exp => exp.id === expenseId);
      if (!expense) return;

      await expenseService.deleteExpense(expenseId);

      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));

      // Update totals
      if (totals) {
        setTotals({
          ...totals,
          totalExpenses: totals.totalExpenses - expense.amount,
          remainingBudget: totals.remainingBudget + expense.amount,
          expenseCount: totals.expenseCount - 1,
        });
      }
    },
    [expenses, totals]
  );

  // =====================================================
  // EFFECTS
  // =====================================================

  // Load project data when projectId changes
  useEffect(() => {
    if (projectId) {
      refreshProject();
      refreshExpenses();
    }
  }, [projectId, refreshProject, refreshExpenses]);

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const contextValue: ProjectContextType = useMemo(
    () => ({
      // State
      projectId,
      project,
      expenses,
      totals,
      metadata,
      permissions,
      loadingState,
      expensesLoadingState,
      error,
      // Actions
      setProjectId,
      refreshProject,
      clearProject,
      refreshExpenses,
      addExpense,
      updateExpense,
      deleteExpense,
    }),
    [
      projectId,
      project,
      expenses,
      totals,
      metadata,
      permissions,
      loadingState,
      expensesLoadingState,
      error,
      setProjectId,
      refreshProject,
      clearProject,
      refreshExpenses,
      addExpense,
      updateExpense,
      deleteExpense,
    ]
  );

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useProject(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}

// =====================================================
// SELECTOR HOOKS (for performance optimization)
// =====================================================

export function useProjectId(): string | null {
  const { projectId } = useProject();
  return projectId;
}

export function useProjectData(): Project | null {
  const { project } = useProject();
  return project;
}

export function useProjectExpenses(): Expense[] {
  const { expenses } = useProject();
  return expenses;
}

export function useProjectTotals(): ProjectTotals | null {
  const { totals } = useProject();
  return totals;
}

export function useProjectPermissions(): ProjectPermissions {
  const { permissions } = useProject();
  return permissions;
}

export function useProjectLoading(): boolean {
  const { loadingState } = useProject();
  return loadingState === 'loading';
}

export function useProjectError(): string | null {
  const { error } = useProject();
  return error;
}

export default ProjectContext;
