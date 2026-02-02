/**
 * CivManager - Navigation Types
 * RESTORED to match canonical screens
 */

import type { StackScreenProps } from '@react-navigation/stack';

/* =====================================================
   USER ROLES (kept in sync with src/types/index.ts)
   ===================================================== */

export enum UserRole {
  OWNER = 'OWNER',
  SUPERVISOR = 'SUPERVISOR',
}

/* =====================================================
   ROOT STACK PARAM LIST
   Matches canonical screens from audit report
   ===================================================== */

export type RootStackParamList = {
  /* Auth */
  Auth: undefined;

  /* Project list (entry point after login) */
  ProjectList: undefined;

  /* Profile */
  Profile: undefined;

  /* Project-centric flows */
  ProjectDetailOwner: {
    projectId: string;
  };

  ProjectDetailSupervisor: {
    projectId: string;
  };

  AddExpense: {
    projectId: string;
  };

  /* Owner-only */
  ProjectDashboard: { projectId: string };
  ProjectAuditLogs: { projectId: string };
  ProjectReports: { projectId: string };
  UserManagement: undefined;
};

/* =====================================================
   SCREEN PROPS (TYPE SAFE)
   ===================================================== */

export type RootStackScreenProps<
  T extends keyof RootStackParamList
> = StackScreenProps<RootStackParamList, T>;

/* =====================================================
   INDIVIDUAL SCREEN PROPS
   ===================================================== */

export type AuthScreenProps = RootStackScreenProps<'Auth'>;
export type ProjectListScreenProps = RootStackScreenProps<'ProjectList'>;
export type ProfileScreenProps = RootStackScreenProps<'Profile'>;
export type ProjectDetailOwnerScreenProps = RootStackScreenProps<'ProjectDetailOwner'>;
export type ProjectDetailSupervisorScreenProps = RootStackScreenProps<'ProjectDetailSupervisor'>;
export type AddExpenseScreenProps = RootStackScreenProps<'AddExpense'>;
export type ProjectDashboardScreenProps = RootStackScreenProps<'ProjectDashboard'>;
export type ProjectAuditLogsScreenProps = RootStackScreenProps<'ProjectAuditLogs'>;
export type ProjectReportsScreenProps = RootStackScreenProps<'ProjectReports'>;
export type UserManagementScreenProps = RootStackScreenProps<'UserManagement'>;

/* =====================================================
   COMMON PARAM TYPES (OPTIONAL HELPERS)
   ===================================================== */

export interface ProjectRouteParams {
  projectId: string;
}

export interface ReportFilterParams {
  projectId?: string;
  range?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
