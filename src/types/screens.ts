/**
 * CivManager - Screen Type Definitions
 * Strict TypeScript props for every screen
 * Screens rely ONLY on route params + context
 */

import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { DateRangeFilter, ExportFormat, ExpenseCategory } from './index';

// =====================================================
// NAVIGATION PARAM TYPES
// =====================================================

export type RootStackParamList = {
  // Auth Flow
  Login: undefined;
  
  // Main Tabs
  MainTabs: undefined;
  
  // Project Screens
  ProjectList: undefined;
  ProjectDetail: { projectId: string };
  ProjectDetailOwner: { projectId: string };
  ProjectDetailSupervisor: { projectId: string };
  
  // Expense Screens
  AddProjectExpense: { projectId: string };
  
  // Financial Screens (Owner)
  FinancialDashboard: { projectId?: string };
  OwnerFinancialDashboard: { projectId: string };
  
  // Reports & Exports
  ReportsAndExports: { projectId?: string };
  
  // Audit Logs (Owner/Admin)
  OwnerAuditLogs: { projectId?: string };
  
  // Admin Screens
  UserManagement: undefined;
  
  // Profile
  Profile: undefined;
};

// =====================================================
// SCREEN NAVIGATION PROPS
// =====================================================

// Generic navigation prop type
export type ScreenNavigationProp<T extends keyof RootStackParamList> = 
  StackNavigationProp<RootStackParamList, T>;

// Generic route prop type
export type ScreenRouteProp<T extends keyof RootStackParamList> = 
  RouteProp<RootStackParamList, T>;

// =====================================================
// INDIVIDUAL SCREEN PROPS
// =====================================================

/**
 * LoginScreen Props
 * No route params required
 */
export interface LoginScreenProps {
  navigation: ScreenNavigationProp<'Login'>;
  route: ScreenRouteProp<'Login'>;
}

/**
 * ProjectListScreen Props
 * No route params required
 */
export interface ProjectListScreenProps {
  navigation: ScreenNavigationProp<'ProjectList'>;
  route: ScreenRouteProp<'ProjectList'>;
}

/**
 * ProjectDetailScreen Props
 * Requires projectId from route params
 */
export interface ProjectDetailScreenProps {
  navigation: ScreenNavigationProp<'ProjectDetail'>;
  route: ScreenRouteProp<'ProjectDetail'>;
}

/**
 * ProjectDetailOwnerScreen Props
 * Requires projectId from route params
 * Owner-specific view with budget/profit visibility
 */
export interface ProjectDetailOwnerScreenProps {
  navigation: ScreenNavigationProp<'ProjectDetailOwner'>;
  route: ScreenRouteProp<'ProjectDetailOwner'>;
}

/**
 * ProjectDetailSupervisorScreen Props
 * Requires projectId from route params
 * Supervisor-specific view without budget visibility
 */
export interface ProjectDetailSupervisorScreenProps {
  navigation: ScreenNavigationProp<'ProjectDetailSupervisor'>;
  route: ScreenRouteProp<'ProjectDetailSupervisor'>;
}

/**
 * AddProjectExpenseScreen Props
 * Requires projectId from route params
 */
export interface AddProjectExpenseScreenProps {
  navigation: ScreenNavigationProp<'AddProjectExpense'>;
  route: ScreenRouteProp<'AddProjectExpense'>;
}

/**
 * FinancialDashboardScreen Props
 * Optional projectId for project-specific view
 */
export interface FinancialDashboardScreenProps {
  navigation: ScreenNavigationProp<'FinancialDashboard'>;
  route: ScreenRouteProp<'FinancialDashboard'>;
}

/**
 * OwnerFinancialDashboardScreen Props
 * Requires projectId from route params
 */
export interface OwnerFinancialDashboardScreenProps {
  navigation: ScreenNavigationProp<'OwnerFinancialDashboard'>;
  route: ScreenRouteProp<'OwnerFinancialDashboard'>;
}

/**
 * ReportsAndExportsScreen Props
 * Optional projectId for project-specific reports
 */
export interface ReportsAndExportsScreenProps {
  navigation: ScreenNavigationProp<'ReportsAndExports'>;
  route: ScreenRouteProp<'ReportsAndExports'>;
}

/**
 * OwnerAuditLogsScreen Props
 * Optional projectId for project-specific audit logs
 */
export interface OwnerAuditLogsScreenProps {
  navigation: ScreenNavigationProp<'OwnerAuditLogs'>;
  route: ScreenRouteProp<'OwnerAuditLogs'>;
}

/**
 * UserManagementScreen Props
 * Admin only - no route params required
 */
export interface UserManagementScreenProps {
  navigation: ScreenNavigationProp<'UserManagement'>;
  route: ScreenRouteProp<'UserManagement'>;
}

/**
 * ProfileScreen Props
 * No route params required
 */
export interface ProfileScreenProps {
  navigation: ScreenNavigationProp<'Profile'>;
  route: ScreenRouteProp<'Profile'>;
}

// =====================================================
// SCREEN STATE TYPES
// =====================================================

/**
 * Common screen state for async data loading
 */
export interface ScreenAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

/**
 * Project list screen state
 */
export interface ProjectListState {
  searchQuery: string;
  filterStatus: string | null;
  sortBy: 'name' | 'date' | 'status';
  sortOrder: 'asc' | 'desc';
}

/**
 * Expense form state
 */
export interface ExpenseFormState {
  amount: string;
  description: string;
  category: ExpenseCategory | null;
  date: Date;
  notes: string;
  attachments: string[];
  isSubmitting: boolean;
  errors: Record<string, string>;
}

/**
 * Report filter state
 */
export interface ReportFilterState {
  dateRange: DateRangeFilter;
  customStartDate: Date | null;
  customEndDate: Date | null;
  selectedCategories: ExpenseCategory[];
  exportFormat: ExportFormat;
}

/**
 * Audit log filter state
 */
export interface AuditLogFilterState {
  dateRange: DateRangeFilter;
  customStartDate: Date | null;
  customEndDate: Date | null;
  actionTypes: string[];
  userFilter: string | null;
}

// =====================================================
// SCREEN CALLBACK TYPES
// =====================================================

/**
 * Navigation callbacks for screens
 */
export interface ProjectListCallbacks {
  onProjectPress: (projectId: string) => void;
  onAddProject?: () => void;
  onSearch: (query: string) => void;
  onFilter: (status: string | null) => void;
  onSort: (sortBy: 'name' | 'date' | 'status', order: 'asc' | 'desc') => void;
}

export interface ProjectDetailCallbacks {
  onAddExpense: () => void;
  onExpensePress: (expenseId: string) => void;
  onViewReports: () => void;
  onViewAuditLogs?: () => void;
  onExport?: () => void;
}

export interface ExpenseFormCallbacks {
  onSubmit: () => void;
  onCancel: () => void;
  onFieldChange: (field: keyof ExpenseFormState, value: any) => void;
  onAddAttachment: () => void;
  onRemoveAttachment: (index: number) => void;
}

export interface ReportCallbacks {
  onFilterChange: (filter: Partial<ReportFilterState>) => void;
  onExport: (format: ExportFormat) => void;
  onRefresh: () => void;
}

// =====================================================
// TEST ID CONSTANTS
// =====================================================

/**
 * Test IDs for UI testing with Selenium
 * Consistent naming convention: screen-element-action
 */
export const TestIds = {
  // Login Screen
  LOGIN_EMAIL_INPUT: 'login-email-input',
  LOGIN_PASSWORD_INPUT: 'login-password-input',
  LOGIN_SUBMIT_BUTTON: 'login-submit-button',
  LOGIN_ERROR_MESSAGE: 'login-error-message',
  
  // Project List Screen
  PROJECT_LIST_CONTAINER: 'project-list-container',
  PROJECT_LIST_SEARCH_INPUT: 'project-list-search-input',
  PROJECT_LIST_FILTER_BUTTON: 'project-list-filter-button',
  PROJECT_LIST_ITEM: 'project-list-item',
  PROJECT_LIST_EMPTY: 'project-list-empty',
  PROJECT_LIST_LOADING: 'project-list-loading',
  PROJECT_LIST_ERROR: 'project-list-error',
  
  // Project Detail Screen
  PROJECT_DETAIL_CONTAINER: 'project-detail-container',
  PROJECT_DETAIL_HEADER: 'project-detail-header',
  PROJECT_DETAIL_BUDGET: 'project-detail-budget',
  PROJECT_DETAIL_EXPENSES: 'project-detail-expenses',
  PROJECT_DETAIL_ADD_EXPENSE: 'project-detail-add-expense',
  PROJECT_DETAIL_LOADING: 'project-detail-loading',
  PROJECT_DETAIL_ERROR: 'project-detail-error',
  
  // Expense Form Screen
  EXPENSE_FORM_CONTAINER: 'expense-form-container',
  EXPENSE_FORM_AMOUNT: 'expense-form-amount',
  EXPENSE_FORM_DESCRIPTION: 'expense-form-description',
  EXPENSE_FORM_CATEGORY: 'expense-form-category',
  EXPENSE_FORM_DATE: 'expense-form-date',
  EXPENSE_FORM_SUBMIT: 'expense-form-submit',
  EXPENSE_FORM_CANCEL: 'expense-form-cancel',
  
  // Reports Screen
  REPORTS_CONTAINER: 'reports-container',
  REPORTS_DATE_FILTER: 'reports-date-filter',
  REPORTS_EXPORT_PDF: 'reports-export-pdf',
  REPORTS_EXPORT_CSV: 'reports-export-csv',
  REPORTS_EXPORT_EXCEL: 'reports-export-excel',
  REPORTS_LOADING: 'reports-loading',
  REPORTS_ERROR: 'reports-error',
  
  // Audit Logs Screen
  AUDIT_LOGS_CONTAINER: 'audit-logs-container',
  AUDIT_LOGS_LIST: 'audit-logs-list',
  AUDIT_LOGS_FILTER: 'audit-logs-filter',
  AUDIT_LOGS_LOADING: 'audit-logs-loading',
  AUDIT_LOGS_ERROR: 'audit-logs-error',
  
  // Common Components
  LOADING_INDICATOR: 'loading-indicator',
  ERROR_STATE: 'error-state',
  EMPTY_STATE: 'empty-state',
  RETRY_BUTTON: 'retry-button',
} as const;

export type TestIdKey = keyof typeof TestIds;
