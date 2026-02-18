/**
 * CivManager - Services Index
 * Central export for all services
 */

export { projectService } from './projectService';
export { expenseService } from './expenseService';
export { exportService } from './exportService';
export { auditLogService } from './auditLogService';
export { 
  supabase, 
  isSupabaseConfigured, 
  testSupabaseConnection,
  testDatabaseQuery,
  logSupabaseError
} from './supabaseClient';
