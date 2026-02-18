/**
 * CivManager - Project Service
 * Production-ready Supabase integration with proper error handling
 */

import { supabase, isSupabaseConfigured, logSupabaseError } from './supabaseClient';

// =====================================================
// TYPES (Backend-Aligned)
// =====================================================

export interface Project {
  id: string;
  name: string;
  status: 'active' | 'planning' | 'completed' | 'on_hold';
  due_date: string;
  budget: number;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectWithExpenses extends Project {
  total_expenses: number;
  expense_count: number;
  remaining_budget: number;
}

export interface ProjectTotals {
  total_budget: number;
  total_expenses: number;
  remaining_budget: number;
  expense_count: number;
}

export interface ProjectFilter {
  status?: string;
  search?: string;
}

// =====================================================
// ERROR HANDLING
// =====================================================

export class ProjectServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'ProjectServiceError';
  }
}

// =====================================================
// MOCK DATA (for development/fallback)
// =====================================================

// Use a mutable array for mock data so new projects can be added
let MOCK_PROJECTS: ProjectWithExpenses[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    name: 'Downtown Office Complex',
    status: 'active',
    due_date: '2026-06-30',
    budget: 500000,
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: '2026-01-01T10:00:00Z',
    total_expenses: 205000,
    expense_count: 2,
    remaining_budget: 295000,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    name: 'Residential Tower Phase 1',
    status: 'active',
    due_date: '2026-09-15',
    budget: 750000,
    created_by: '11111111-1111-1111-1111-111111111111',
    created_at: '2026-01-15T10:00:00Z',
    total_expenses: 0,
    expense_count: 0,
    remaining_budget: 750000,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    name: 'Shopping Mall Renovation',
    status: 'planning',
    due_date: '2026-12-01',
    budget: 300000,
    created_by: '22222222-2222-2222-2222-222222222222',
    created_at: '2026-02-01T10:00:00Z',
    total_expenses: 0,
    expense_count: 0,
    remaining_budget: 300000,
  },
];

// Check if we should use mock data (when Supabase is not configured or fails)
// Uses the centralized configuration check from supabaseClient
const shouldUseMockData = (): boolean => {
  return !isSupabaseConfigured();
};

// Helper function to check if user is authenticated before making Supabase requests
const checkAuthSession = async (): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      if (__DEV__) {
        console.log('[ProjectService] User not authenticated - returning empty results');
      }
      return false;
    }
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('[ProjectService] Auth session check error:', error);
    }
    return false;
  }
};

// =====================================================
// PROJECT SERVICE
// =====================================================

export const projectService = {
  /**
   * Get all projects for the current user
   * Uses RLS to filter by user access
   */
  async getProjects(userId?: string, filters?: ProjectFilter): Promise<ProjectWithExpenses[]> {
    // Use mock data if Supabase is not configured
    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ProjectService] Using mock data (Supabase not configured)');
        console.log('[ProjectService] Current MOCK_PROJECTS count:', MOCK_PROJECTS.length);
      }
      let filtered = [...MOCK_PROJECTS];
      
      if (filters?.status && filters.status !== 'All') {
        const statusMap: Record<string, string> = {
          'In Progress': 'active',
          'Planning': 'planning',
          'Completed': 'completed',
          'On Hold': 'on_hold',
        };
        const status = statusMap[filters.status] || filters.status.toLowerCase().replace(' ', '_');
        filtered = filtered.filter(p => p.status === status);
      }
      
      if (filters?.search) {
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(filters.search!.toLowerCase())
        );
      }
      
      if (__DEV__) {
        console.log('[ProjectService] Returning', filtered.length, 'projects');
      }
      
      return filtered;
    }

    // Check if user is authenticated before making Supabase requests
    const isAuthenticated = await checkAuthSession();
    if (!isAuthenticated) {
      return [];
    }
    
    try {
      // Build query - only select columns that exist in the database schema
      // NOTE: 'updated_at' is NOT in the schema, removed to prevent 400 error
      // NOTE: 'expenses' join requires the table to exist with proper foreign key
      let query = supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          due_date,
          budget,
          created_by,
          created_at,
          expenses(id, amount)
        `)
        .order('created_at', { ascending: false });

      // Apply status filter with proper value mapping
      // UI shows: "In Progress", "Planning", "Completed", "On Hold"
      // DB stores: "active", "planning", "completed", "on_hold"
      if (filters?.status && filters.status !== 'All') {
        const statusMap: Record<string, string> = {
          'In Progress': 'active',
          'Planning': 'planning',
          'Completed': 'completed',
          'On Hold': 'on_hold',
          'in_progress': 'active',
        };
        const dbStatus = statusMap[filters.status] || filters.status.toLowerCase().replace(' ', '_');
        query = query.eq('status', dbStatus);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      // Enhanced error logging for debugging
      if (error) {
        logSupabaseError('getProjects', error);
        throw new ProjectServiceError(
          `Failed to fetch projects: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      if (!data) {
        return [];
      }

      // Transform data to include calculated expense totals
      // NOTE: PostgreSQL NUMERIC type is returned as string in JSON
      // We need to convert budget and amount to numbers
      const projectsWithExpenses: ProjectWithExpenses[] = data.map((project: any) => {
        const expenses = project.expenses || [];
        // Convert amount from string to number (PostgreSQL NUMERIC behavior)
        const totalExpenses = expenses.reduce(
          (sum: number, exp: any) => sum + parseFloat(exp.amount || 0),
          0
        );
        // Convert budget from string to number
        const budget = parseFloat(project.budget || 0);

        return {
          id: project.id,
          name: project.name,
          status: project.status,
          due_date: project.due_date,
          budget: budget,
          created_by: project.created_by,
          created_at: project.created_at,
          updated_at: project.updated_at, // Will be undefined if not in schema
          total_expenses: totalExpenses,
          expense_count: expenses.length,
          remaining_budget: budget - totalExpenses,
        };
      });

      if (__DEV__) {
        console.log('[ProjectService] Fetched projects:', projectsWithExpenses.length);
      }

      return projectsWithExpenses;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(
        'Unexpected error fetching projects',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Get a single project by ID with expense totals
   */
  async getProjectById(projectId: string): Promise<ProjectWithExpenses | null> {
    // Use mock data if Supabase is not configured
    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ProjectService] Using mock data for project:', projectId);
      }
      return MOCK_PROJECTS.find(p => p.id === projectId) || null;
    }
    
    try {
      // Use .maybeSingle() instead of .single() to avoid 406 errors
      // .single() throws PGRST116 if no rows or multiple rows found
      // .maybeSingle() returns null if no rows, throws if multiple
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          status,
          due_date,
          budget,
          created_by,
          created_at,
          expenses(id, amount)
        `)
        .eq('id', projectId)
        .maybeSingle();

      if (error) {
        // Enhanced error logging
        if (__DEV__) {
          console.error('[ProjectService] Supabase error in getProjectById:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
        }
        throw new ProjectServiceError(
          `Failed to fetch project: ${error.message}`,
          'FETCH_ERROR',
          error
        );
      }

      if (!data) {
        return null;
      }

      // Calculate expense totals
      // NOTE: PostgreSQL NUMERIC type is returned as string in JSON
      const expenses = data.expenses || [];
      const totalExpenses = expenses.reduce(
        (sum: number, exp: any) => sum + parseFloat(exp.amount || 0),
        0
      );
      const budget = parseFloat(data.budget || 0);

      const project: ProjectWithExpenses = {
        id: data.id,
        name: data.name,
        status: data.status,
        due_date: data.due_date,
        budget: budget,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: (data as any).updated_at, // Optional field, may not exist in schema
        total_expenses: totalExpenses,
        expense_count: expenses.length,
        remaining_budget: budget - totalExpenses,
      };

      if (__DEV__) {
        console.log('[ProjectService] Fetched project:', project.id, project.name);
      }

      return project;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(
        'Unexpected error fetching project',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Get project totals (for dashboard views)
   */
  async getProjectTotals(projectId: string): Promise<ProjectTotals> {
    try {
      // Get project budget
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('budget')
        .eq('id', projectId)
        .single();

      if (projectError) {
        throw new ProjectServiceError(
          `Failed to fetch project budget: ${projectError.message}`,
          'FETCH_ERROR',
          projectError
        );
      }

      // Get expense totals
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('project_id', projectId);

      if (expensesError) {
        throw new ProjectServiceError(
          `Failed to fetch expenses: ${expensesError.message}`,
          'FETCH_ERROR',
          expensesError
        );
      }

      const totalExpenses = (expenses || []).reduce(
        (sum, exp) => sum + (exp.amount || 0),
        0
      );
      const budget = project?.budget || 0;

      return {
        total_budget: budget,
        total_expenses: totalExpenses,
        remaining_budget: budget - totalExpenses,
        expense_count: expenses?.length || 0,
      };
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(
        'Unexpected error fetching project totals',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Create a new project
   */
  async createProject(
    projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Project> {
    // Use mock mode if Supabase is not configured
    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ProjectService] Creating project in mock mode');
      }
      
      const newProject: Project = {
        id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: projectData.name,
        status: projectData.status || 'planning',
        due_date: projectData.due_date,
        budget: projectData.budget,
        created_by: projectData.created_by,
        created_at: new Date().toISOString(),
      };
      
      // Add to mock data
      const newProjectWithExpenses: ProjectWithExpenses = {
        ...newProject,
        total_expenses: 0,
        expense_count: 0,
        remaining_budget: projectData.budget,
      };
      MOCK_PROJECTS.unshift(newProjectWithExpenses);
      
      if (__DEV__) {
        console.log('[ProjectService] Created mock project:', newProject.id, newProject.name);
      }
      
      return newProject;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          status: projectData.status || 'planning',
          due_date: projectData.due_date,
          budget: projectData.budget,
          created_by: projectData.created_by,
        })
        .select()
        .single();

      if (error) {
        throw new ProjectServiceError(
          `Failed to create project: ${error.message}`,
          'CREATE_ERROR',
          error
        );
      }

      if (__DEV__) {
        console.log('[ProjectService] Created project:', data.id, data.name);
      }

      return data;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(
        'Unexpected error creating project',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Update an existing project
   */
  async updateProject(
    projectId: string,
    updates: Partial<Omit<Project, 'id' | 'created_at' | 'created_by'>>
  ): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        throw new ProjectServiceError(
          `Failed to update project: ${error.message}`,
          'UPDATE_ERROR',
          error
        );
      }

      if (__DEV__) {
        console.log('[ProjectService] Updated project:', projectId);
      }

      return data;
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(
        'Unexpected error updating project',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        throw new ProjectServiceError(
          `Failed to delete project: ${error.message}`,
          'DELETE_ERROR',
          error
        );
      }

      if (__DEV__) {
        console.log('[ProjectService] Deleted project:', projectId);
      }
    } catch (error) {
      if (error instanceof ProjectServiceError) {
        throw error;
      }
      throw new ProjectServiceError(
        'Unexpected error deleting project',
        'UNEXPECTED_ERROR',
        error
      );
    }
  },

  /**
   * Subscribe to project changes (real-time)
   * Returns a no-op unsubscribe function if Supabase is not configured
   */
  subscribeToProjects(
    userId: string,
    on_change: (payload: any) => void
  ): () => void {
    // Return no-op if Supabase is not configured
    if (shouldUseMockData()) {
      if (__DEV__) {
        console.log('[ProjectService] Real-time subscriptions disabled (using mock data)');
      }
      return () => {
        // No-op unsubscribe for mock mode
      };
    }

    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          if (__DEV__) {
            console.log('[ProjectService] Real-time update:', payload.eventType);
          }
          on_change(payload);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  },
};

export default projectService;
