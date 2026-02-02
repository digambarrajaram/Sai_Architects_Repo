/**
 * CivManager - Testing Utilities
 * Utilities to ensure UI testing readiness with Python Selenium
 */

/**
 * Test ID prefix for consistent naming
 */
export const TEST_ID_PREFIX = 'civmanager';

/**
 * Generate consistent test IDs for Selenium testing
 * @param component - Component name
 * @param element - Element identifier
 * @returns Formatted test ID string
 */
export const generateTestId = (component: string, element: string): string => {
  return `${TEST_ID_PREFIX}-${component}-${element}`.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Common test IDs for reusable components
 */
export const CommonTestIds = {
  // Loading states
  loadingSpinner: generateTestId('common', 'loading-spinner'),
  loadingContainer: generateTestId('common', 'loading-container'),
  
  // Error states
  errorContainer: generateTestId('common', 'error-container'),
  errorMessage: generateTestId('common', 'error-message'),
  errorRetryButton: generateTestId('common', 'error-retry-button'),
  
  // Empty states
  emptyContainer: generateTestId('common', 'empty-container'),
  emptyMessage: generateTestId('common', 'empty-message'),
  emptyActionButton: generateTestId('common', 'empty-action-button'),
  
  // Navigation
  backButton: generateTestId('nav', 'back-button'),
  menuButton: generateTestId('nav', 'menu-button'),
  
  // Forms
  submitButton: generateTestId('form', 'submit-button'),
  cancelButton: generateTestId('form', 'cancel-button'),
} as const;

/**
 * Screen-specific test IDs
 */
export const ScreenTestIds = {
  // Login Screen
  login: {
    container: generateTestId('login', 'container'),
    emailInput: generateTestId('login', 'email-input'),
    passwordInput: generateTestId('login', 'password-input'),
    submitButton: generateTestId('login', 'submit-button'),
    errorMessage: generateTestId('login', 'error-message'),
  },
  
  // Project List Screen
  projectList: {
    container: generateTestId('project-list', 'container'),
    searchInput: generateTestId('project-list', 'search-input'),
    filterButton: generateTestId('project-list', 'filter-button'),
    projectItem: (id: string) => generateTestId('project-list', `item-${id}`),
    addButton: generateTestId('project-list', 'add-button'),
    refreshButton: generateTestId('project-list', 'refresh-button'),
  },
  
  // Project Detail Screen
  projectDetail: {
    container: generateTestId('project-detail', 'container'),
    header: generateTestId('project-detail', 'header'),
    budgetSection: generateTestId('project-detail', 'budget-section'),
    expenseList: generateTestId('project-detail', 'expense-list'),
    expenseItem: (id: string) => generateTestId('project-detail', `expense-${id}`),
    addExpenseButton: generateTestId('project-detail', 'add-expense-button'),
    exportButton: generateTestId('project-detail', 'export-button'),
  },
  
  // Add Expense Screen
  addExpense: {
    container: generateTestId('add-expense', 'container'),
    categorySelect: generateTestId('add-expense', 'category-select'),
    amountInput: generateTestId('add-expense', 'amount-input'),
    descriptionInput: generateTestId('add-expense', 'description-input'),
    dateInput: generateTestId('add-expense', 'date-input'),
    submitButton: generateTestId('add-expense', 'submit-button'),
    cancelButton: generateTestId('add-expense', 'cancel-button'),
  },
  
  // Reports Screen
  reports: {
    container: generateTestId('reports', 'container'),
    filterSection: generateTestId('reports', 'filter-section'),
    dateRangeStart: generateTestId('reports', 'date-range-start'),
    dateRangeEnd: generateTestId('reports', 'date-range-end'),
    exportPdfButton: generateTestId('reports', 'export-pdf-button'),
    exportCsvButton: generateTestId('reports', 'export-csv-button'),
    exportExcelButton: generateTestId('reports', 'export-excel-button'),
    reportContent: generateTestId('reports', 'report-content'),
  },
  
  // Dashboard Screen
  dashboard: {
    container: generateTestId('dashboard', 'container'),
    summaryCard: generateTestId('dashboard', 'summary-card'),
    chartSection: generateTestId('dashboard', 'chart-section'),
    projectSummary: (id: string) => generateTestId('dashboard', `project-summary-${id}`),
  },
  
  // Profile Screen
  profile: {
    container: generateTestId('profile', 'container'),
    userInfo: generateTestId('profile', 'user-info'),
    logoutButton: generateTestId('profile', 'logout-button'),
    settingsButton: generateTestId('profile', 'settings-button'),
  },
  
  // Audit Logs Screen
  auditLogs: {
    container: generateTestId('audit-logs', 'container'),
    filterSection: generateTestId('audit-logs', 'filter-section'),
    logItem: (id: string) => generateTestId('audit-logs', `log-${id}`),
    exportButton: generateTestId('audit-logs', 'export-button'),
  },
  
  // User Management Screen
  userManagement: {
    container: generateTestId('user-management', 'container'),
    userList: generateTestId('user-management', 'user-list'),
    userItem: (id: string) => generateTestId('user-management', `user-${id}`),
    addUserButton: generateTestId('user-management', 'add-user-button'),
    searchInput: generateTestId('user-management', 'search-input'),
  },
} as const;

/**
 * Accessibility props for testing
 * Ensures components are accessible and testable
 */
export interface TestableProps {
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'text' | 'image' | 'header' | 'search' | 'list' | 'listitem' | 'none';
}

/**
 * Generate testable props for a component
 * @param testId - Test ID for the component
 * @param label - Accessibility label
 * @param hint - Accessibility hint (optional)
 * @param role - Accessibility role (optional)
 * @returns TestableProps object
 */
export const getTestableProps = (
  testId: string,
  label: string,
  hint?: string,
  role?: TestableProps['accessibilityRole']
): TestableProps => ({
  testID: testId,
  accessibilityLabel: label,
  ...(hint && { accessibilityHint: hint }),
  ...(role && { accessibilityRole: role }),
});

/**
 * Layout constraints for testing
 * Ensures consistent heights and prevents overflow issues
 */
export const LayoutConstraints = {
  // Minimum heights for scrollable content
  minListItemHeight: 60,
  minCardHeight: 120,
  minButtonHeight: 44,
  minInputHeight: 48,
  
  // Maximum heights to prevent overflow
  maxModalHeight: '80%',
  maxDropdownHeight: 300,
  
  // Safe area padding
  safeAreaPadding: {
    top: 44,
    bottom: 34,
    horizontal: 16,
  },
  
  // Standard spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
} as const;

/**
 * Validate that a component has proper test attributes
 * @param props - Component props to validate
 * @returns boolean indicating if props are test-ready
 */
export const validateTestReadiness = (props: Record<string, unknown>): boolean => {
  const hasTestId = typeof props.testID === 'string' && props.testID.length > 0;
  const hasAccessibilityLabel = typeof props.accessibilityLabel === 'string' && props.accessibilityLabel.length > 0;
  return hasTestId && hasAccessibilityLabel;
};

/**
 * Debug helper to log test IDs in development
 * @param componentName - Name of the component
 * @param testId - Test ID being used
 */
export const logTestId = (componentName: string, testId: string): void => {
  if (__DEV__) {
    console.log(`[TestID] ${componentName}: ${testId}`);
  }
};
