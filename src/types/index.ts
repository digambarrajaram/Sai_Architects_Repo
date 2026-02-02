/**
 * CivManager - Core Type Definitions
 * All shared types for the application
 */

// =====================================================
// USER & ROLE TYPES
// =====================================================

export enum UserRole {
  OWNER = 'OWNER',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLogin?: string;
}

// =====================================================
// PROJECT TYPES
// =====================================================

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget?: number;
  location?: string;
  clientName?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ProjectTotals {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  expenseCount: number;
  profitLoss?: number; // Owner only
}

export interface ProjectMetadata {
  lastExpenseDate?: string;
  supervisorCount: number;
  documentCount: number;
}

// =====================================================
// EXPENSE TYPES
// =====================================================

export interface Expense {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  createdBy: string;
  createdAt: string;
  attachments?: string[];
  notes?: string;
}

export enum ExpenseCategory {
  LABOR = 'LABOR',
  MATERIALS = 'MATERIALS',
  EQUIPMENT = 'EQUIPMENT',
  TRANSPORT = 'TRANSPORT',
  PERMITS = 'PERMITS',
  UTILITIES = 'UTILITIES',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
  MISCELLANEOUS = 'MISCELLANEOUS',
}

// =====================================================
// REPORT & EXPORT TYPES
// =====================================================

export type DateRangeFilter = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ReportFilter {
  projectId: string;
  dateRange: DateRangeFilter;
  customRange?: DateRange;
  categories?: ExpenseCategory[];
}

export type ExportFormat = 'PDF' | 'CSV' | 'EXCEL';

export interface ExportConfig {
  format: ExportFormat;
  filter: ReportFilter;
  includeCharts?: boolean;
  includeSummary?: boolean;
}

export interface ReportData {
  projectId: string;
  projectName: string;
  generatedAt: string;
  filter: ReportFilter;
  totals: ProjectTotals;
  expenses: Expense[];
  categoryBreakdown: CategoryBreakdown[];
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  total: number;
  percentage: number;
  count: number;
}

// =====================================================
// AUDIT LOG TYPES
// =====================================================

export interface AuditLog {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
}

export enum AuditEntityType {
  PROJECT = 'PROJECT',
  EXPENSE = 'EXPENSE',
  USER = 'USER',
  REPORT = 'REPORT',
}

// =====================================================
// UI STATE TYPES
// =====================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// =====================================================
// PERMISSION TYPES
// =====================================================

export enum Permission {
  // Project permissions
  VIEW_PROJECT = 'VIEW_PROJECT',
  CREATE_PROJECT = 'CREATE_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  DELETE_PROJECT = 'DELETE_PROJECT',
  
  // Expense permissions
  VIEW_EXPENSES = 'VIEW_EXPENSES',
  ADD_EXPENSE = 'ADD_EXPENSE',
  EDIT_EXPENSE = 'EDIT_EXPENSE',
  DELETE_EXPENSE = 'DELETE_EXPENSE',
  
  // Financial permissions (Owner only)
  VIEW_BUDGET = 'VIEW_BUDGET',
  EDIT_BUDGET = 'EDIT_BUDGET',
  VIEW_PROFIT_LOSS = 'VIEW_PROFIT_LOSS',
  
  // Report permissions
  VIEW_REPORTS = 'VIEW_REPORTS',
  EXPORT_REPORTS = 'EXPORT_REPORTS',
  
  // Audit permissions (Owner only)
  VIEW_AUDIT_LOGS = 'VIEW_AUDIT_LOGS',
  
  // Admin permissions
  MANAGE_USERS = 'MANAGE_USERS',
  VIEW_SYSTEM_LOGS = 'VIEW_SYSTEM_LOGS',
}

export interface ProjectPermissions {
  canViewBudget: boolean;
  canEditBudget: boolean;
  canViewProfitLoss: boolean;
  canAddExpense: boolean;
  canEditExpense: boolean;
  canDeleteExpense: boolean;
  canViewAuditLogs: boolean;
  canExportReports: boolean;
}

// Re-export screen types
export * from './screens';
