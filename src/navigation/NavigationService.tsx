/**
 * CivManager - Navigation Service
 * Programmatic navigation utilities
 * Simplified to match current RootStackParamList
 */

import { createRef } from 'react';
import { NavigationContainerRef, CommonActions, StackActions } from '@react-navigation/native';
import type { RootStackParamList } from './types';

// =====================================================
// NAVIGATION REF
// =====================================================

export const navigationRef = createRef<NavigationContainerRef<RootStackParamList>>();

// =====================================================
// NAVIGATION HELPERS
// =====================================================

/**
 * Check if navigation is ready
 */
export function isNavigationReady(): boolean {
  return navigationRef.current?.isReady() ?? false;
}

/**
 * Navigate to a screen
 */
export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T]
): void {
  if (isNavigationReady()) {
    navigationRef.current?.navigate(name as any, params as any);
  }
}

/**
 * Go back to previous screen
 */
export function goBack(): void {
  if (isNavigationReady() && navigationRef.current?.canGoBack()) {
    navigationRef.current?.goBack();
  }
}

/**
 * Reset navigation state
 */
export function reset(state: any): void {
  if (isNavigationReady()) {
    navigationRef.current?.dispatch(CommonActions.reset(state));
  }
}

/**
 * Push a new screen onto the stack
 */
export function push(name: string, params?: object): void {
  if (isNavigationReady()) {
    navigationRef.current?.dispatch(StackActions.push(name, params));
  }
}

/**
 * Pop screens from the stack
 */
export function pop(count: number = 1): void {
  if (isNavigationReady()) {
    navigationRef.current?.dispatch(StackActions.pop(count));
  }
}

/**
 * Pop to the top of the stack
 */
export function popToTop(): void {
  if (isNavigationReady()) {
    navigationRef.current?.dispatch(StackActions.popToTop());
  }
}

// =====================================================
// TYPED NAVIGATION HELPERS
// =====================================================

/**
 * Navigate to Project Detail screen (Owner)
 */
export function navigateToProjectDetailOwner(projectId: string): void {
  navigate('ProjectDetailOwner', { projectId });
}

/**
 * Navigate to Project Detail screen (Supervisor)
 */
export function navigateToProjectDetailSupervisor(projectId: string): void {
  navigate('ProjectDetailSupervisor', { projectId });
}

/**
 * Navigate to Add Expense screen
 */
export function navigateToAddExpense(projectId: string): void {
  navigate('AddExpense', { projectId });
}

/**
 * Navigate to Project Dashboard
 */
export function navigateToProjectDashboard(projectId: string): void {
  navigate('ProjectDashboard', { projectId });
}

/**
 * Navigate to Project Audit Logs
 */
export function navigateToProjectAuditLogs(projectId: string): void {
  navigate('ProjectAuditLogs', { projectId });
}

/**
 * Navigate to Project Reports
 */
export function navigateToProjectReports(projectId: string): void {
  navigate('ProjectReports', { projectId });
}

/**
 * Navigate to Profile
 */
export function navigateToProfile(): void {
  navigate('Profile');
}

/**
 * Navigate to User Management
 */
export function navigateToUserManagement(): void {
  navigate('UserManagement');
}

/**
 * Navigate to Project List
 */
export function navigateToProjectList(): void {
  navigate('ProjectList');
}

/**
 * Navigate to Login (reset auth state)
 */
export function navigateToLogin(): void {
  reset({
    index: 0,
    routes: [{ name: 'Auth' }],
  });
}

// =====================================================
// CURRENT ROUTE HELPERS
// =====================================================

/**
 * Get current route name
 */
export function getCurrentRouteName(): string | undefined {
  if (isNavigationReady()) {
    return navigationRef.current?.getCurrentRoute()?.name;
  }
  return undefined;
}

/**
 * Get current route params
 */
export function getCurrentRouteParams(): object | undefined {
  if (isNavigationReady()) {
    return navigationRef.current?.getCurrentRoute()?.params;
  }
  return undefined;
}

// =====================================================
// NAMED EXPORT FOR App.tsx
// =====================================================

/**
 * Set navigation ref (called from App.tsx)
 */
export function setNavigationRef(ref: NavigationContainerRef<RootStackParamList>): void {
  // The ref is already set via createRef, this is for compatibility
  // with existing App.tsx pattern
}

export const navigationService = {
  navigationRef,
  isNavigationReady,
  navigate,
  goBack,
  reset,
  push,
  pop,
  popToTop,
  navigateToProjectDetailOwner,
  navigateToProjectDetailSupervisor,
  navigateToAddExpense,
  navigateToProjectDashboard,
  navigateToProjectAuditLogs,
  navigateToProjectReports,
  navigateToProfile,
  navigateToUserManagement,
  navigateToProjectList,
  navigateToLogin,
  getCurrentRouteName,
  getCurrentRouteParams,
  setNavigationRef,
};

export default navigationService;
