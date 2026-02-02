/**
 * CivManager - Context Index
 * Central export for all context providers
 */

export { AuthProvider, useAuth } from './AuthContext';
export { 
  ProjectProvider, 
  useProject,
  useProjectId,
  useProjectData,
  useProjectExpenses,
  useProjectTotals,
  useProjectPermissions,
  useProjectLoading,
  useProjectError,
} from './ProjectContext';
