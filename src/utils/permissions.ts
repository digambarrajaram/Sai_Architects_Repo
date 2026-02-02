/**
 * CivManager - Permission Utilities
 * Centralized permission logic
 * Screens ask permissions, not roles directly
 */

import { UserRole, Permission, ProjectPermissions } from '../types';

// =====================================================
// ROLE-PERMISSION MAPPING
// =====================================================

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    // Project permissions
    Permission.VIEW_PROJECT,
    Permission.CREATE_PROJECT,
    Permission.EDIT_PROJECT,
    Permission.DELETE_PROJECT,
    // Expense permissions
    Permission.VIEW_EXPENSES,
    Permission.ADD_EXPENSE,
    Permission.EDIT_EXPENSE,
    Permission.DELETE_EXPENSE,
    // Financial permissions
    Permission.VIEW_BUDGET,
    Permission.EDIT_BUDGET,
    Permission.VIEW_PROFIT_LOSS,
    // Report permissions
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    // Audit permissions
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.SUPERVISOR]: [
    // Project permissions (limited)
    Permission.VIEW_PROJECT,
    // Expense permissions
    Permission.VIEW_EXPENSES,
    Permission.ADD_EXPENSE,
    // Report permissions (limited)
    Permission.VIEW_REPORTS,
  ],
  [UserRole.ADMIN]: [
    // Project permissions (view only)
    Permission.VIEW_PROJECT,
    // Admin permissions
    Permission.MANAGE_USERS,
    Permission.VIEW_SYSTEM_LOGS,
    // Audit permissions
    Permission.VIEW_AUDIT_LOGS,
  ],
};

// =====================================================
// PERMISSION CHECK FUNCTIONS
// =====================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has all specified permissions
 */
export function hasAllPermissions(role: UserRole | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole | null, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// =====================================================
// PROJECT-SPECIFIC PERMISSIONS
// =====================================================

/**
 * Get project-specific permissions based on user role
 * This is used by ProjectContext to provide permission flags
 */
export function getProjectPermissions(role: UserRole | null): ProjectPermissions {
  return {
    canViewBudget: hasPermission(role, Permission.VIEW_BUDGET),
    canEditBudget: hasPermission(role, Permission.EDIT_BUDGET),
    canViewProfitLoss: hasPermission(role, Permission.VIEW_PROFIT_LOSS),
    canAddExpense: hasPermission(role, Permission.ADD_EXPENSE),
    canEditExpense: hasPermission(role, Permission.EDIT_EXPENSE),
    canDeleteExpense: hasPermission(role, Permission.DELETE_EXPENSE),
    canViewAuditLogs: hasPermission(role, Permission.VIEW_AUDIT_LOGS),
    canExportReports: hasPermission(role, Permission.EXPORT_REPORTS),
  };
}

// =====================================================
// ROLE CHECK UTILITIES
// =====================================================

/**
 * Check if user is an Owner
 */
export function isOwner(role: UserRole | null): boolean {
  return role === UserRole.OWNER;
}

/**
 * Check if user is a Supervisor
 */
export function isSupervisor(role: UserRole | null): boolean {
  return role === UserRole.SUPERVISOR;
}

/**
 * Check if user is an Admin
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if user can access financial data
 */
export function canAccessFinancials(role: UserRole | null): boolean {
  return hasAnyPermission(role, [
    Permission.VIEW_BUDGET,
    Permission.VIEW_PROFIT_LOSS,
  ]);
}

/**
 * Check if user can manage expenses
 */
export function canManageExpenses(role: UserRole | null): boolean {
  return hasAnyPermission(role, [
    Permission.ADD_EXPENSE,
    Permission.EDIT_EXPENSE,
    Permission.DELETE_EXPENSE,
  ]);
}

/**
 * Check if user can export data
 */
export function canExport(role: UserRole | null): boolean {
  return hasPermission(role, Permission.EXPORT_REPORTS);
}
