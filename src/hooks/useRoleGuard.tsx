/**
 * CivManager - Role-Based UI Guard Hook
 * Implement role-based visibility inside screens
 * Do NOT create role-based routes
 */

import { useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Permission, ProjectPermissions } from '../types';
import {
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getProjectPermissions,
  isOwner,
  isSupervisor,
  isAdmin,
  canAccessFinancials,
  canManageExpenses,
  canExport,
} from '../utils/permissions';

// =====================================================
// ROLE GUARD HOOK
// =====================================================

export interface UseRoleGuardReturn {
  // Current role
  role: UserRole | null;
  
  // Role checks
  isOwner: boolean;
  isSupervisor: boolean;
  isAdmin: boolean;
  
  // Permission checks
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  
  // Project permissions (memoized)
  projectPermissions: ProjectPermissions;
  
  // Convenience checks
  canAccessFinancials: boolean;
  canManageExpenses: boolean;
  canExport: boolean;
  
  // UI visibility helpers
  showIf: (permission: Permission) => boolean;
  hideIf: (permission: Permission) => boolean;
}

/**
 * Hook for role-based UI visibility
 * Use this in screens to conditionally render UI elements
 */
export function useRoleGuard(): UseRoleGuardReturn {
  const { user } = useAuth();
  const role = user?.role ?? null;

  const checkPermission = useCallback(
    (permission: Permission) => hasPermission(role, permission),
    [role]
  );

  const checkAllPermissions = useCallback(
    (permissions: Permission[]) => hasAllPermissions(role, permissions),
    [role]
  );

  const checkAnyPermission = useCallback(
    (permissions: Permission[]) => hasAnyPermission(role, permissions),
    [role]
  );

  const projectPermissions = useMemo(
    () => getProjectPermissions(role),
    [role]
  );

  const showIf = useCallback(
    (permission: Permission) => hasPermission(role, permission),
    [role]
  );

  const hideIf = useCallback(
    (permission: Permission) => !hasPermission(role, permission),
    [role]
  );

  return {
    role,
    isOwner: isOwner(role),
    isSupervisor: isSupervisor(role),
    isAdmin: isAdmin(role),
    hasPermission: checkPermission,
    hasAllPermissions: checkAllPermissions,
    hasAnyPermission: checkAnyPermission,
    projectPermissions,
    canAccessFinancials: canAccessFinancials(role),
    canManageExpenses: canManageExpenses(role),
    canExport: canExport(role),
    showIf,
    hideIf,
  };
}

// =====================================================
// ROLE GUARD COMPONENT
// =====================================================

interface RoleGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  roles?: UserRole[];
}

/**
 * Component for role-based UI visibility
 * Wraps children and only renders if permission check passes
 */
export function RoleGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  roles,
}: RoleGuardProps): React.ReactElement | null {
  const { user } = useAuth();
  const role = user?.role ?? null;

  // Check by specific roles
  if (roles && roles.length > 0) {
    if (!role || !roles.includes(role)) {
      return fallback as React.ReactElement | null;
    }
    return children as React.ReactElement;
  }

  // Check by single permission
  if (permission) {
    if (!hasPermission(role, permission)) {
      return fallback as React.ReactElement | null;
    }
    return children as React.ReactElement;
  }

  // Check by multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(role, permissions)
      : hasAnyPermission(role, permissions);

    if (!hasAccess) {
      return fallback as React.ReactElement | null;
    }
    return children as React.ReactElement;
  }

  // No permission specified, render children
  return children as React.ReactElement;
}

// =====================================================
// OWNER ONLY COMPONENT
// =====================================================

interface OwnerOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Convenience component for Owner-only content
 */
export function OwnerOnly({ children, fallback = null }: OwnerOnlyProps): React.ReactElement | null {
  const { user } = useAuth();
  const role = user?.role ?? null;
  
  if (!isOwner(role)) {
    return fallback as React.ReactElement | null;
  }
  
  return children as React.ReactElement;
}

// =====================================================
// SUPERVISOR ONLY COMPONENT
// =====================================================

interface SupervisorOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Convenience component for Supervisor-only content
 */
export function SupervisorOnly({ children, fallback = null }: SupervisorOnlyProps): React.ReactElement | null {
  const { user } = useAuth();
  const role = user?.role ?? null;
  
  if (!isSupervisor(role)) {
    return fallback as React.ReactElement | null;
  }
  
  return children as React.ReactElement;
}

// =====================================================
// ADMIN ONLY COMPONENT
// =====================================================

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Convenience component for Admin-only content
 */
export function AdminOnly({ children, fallback = null }: AdminOnlyProps): React.ReactElement | null {
  const { user } = useAuth();
  const role = user?.role ?? null;
  
  if (!isAdmin(role)) {
    return fallback as React.ReactElement | null;
  }
  
  return children as React.ReactElement;
}

export default useRoleGuard;
