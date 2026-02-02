/**
 * CivManager - Project Service
 * Mock data and async simulation for projects
 * NO backend logic - frontend only
 */

import {
  Project,
  ProjectStatus,
  ProjectTotals,
  ProjectMetadata,
} from '../types';

// =====================================================
// MOCK DATA
// =====================================================

const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'Highway Bridge Construction',
    description: 'Construction of a 500m highway bridge over the river',
    status: ProjectStatus.IN_PROGRESS,
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    budget: 5000000,
    location: 'Mumbai, Maharashtra',
    clientName: 'NHAI',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
  },
  {
    id: 'proj-002',
    name: 'Commercial Complex Foundation',
    description: 'Foundation work for a 20-story commercial building',
    status: ProjectStatus.IN_PROGRESS,
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    budget: 2500000,
    location: 'Pune, Maharashtra',
    clientName: 'ABC Developers',
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-06-10T11:00:00Z',
  },
  {
    id: 'proj-003',
    name: 'Residential Township Roads',
    description: 'Internal road network for a 100-acre township',
    status: ProjectStatus.PLANNING,
    startDate: '2024-07-01',
    budget: 1500000,
    location: 'Nashik, Maharashtra',
    clientName: 'XYZ Housing',
    createdAt: '2024-05-15T08:00:00Z',
    updatedAt: '2024-06-01T16:00:00Z',
  },
  {
    id: 'proj-004',
    name: 'Dam Repair Works',
    description: 'Structural repairs and waterproofing of existing dam',
    status: ProjectStatus.ON_HOLD,
    startDate: '2024-02-01',
    budget: 3000000,
    location: 'Aurangabad, Maharashtra',
    clientName: 'State Water Board',
    createdAt: '2024-01-25T12:00:00Z',
    updatedAt: '2024-04-20T10:00:00Z',
  },
  {
    id: 'proj-005',
    name: 'Metro Station Construction',
    description: 'Underground metro station with 4 platforms',
    status: ProjectStatus.IN_PROGRESS,
    startDate: '2023-06-01',
    endDate: '2025-06-30',
    budget: 15000000,
    location: 'Mumbai, Maharashtra',
    clientName: 'MMRDA',
    createdAt: '2023-05-01T10:00:00Z',
    updatedAt: '2024-06-18T09:00:00Z',
  },
];

const MOCK_TOTALS: Record<string, ProjectTotals> = {
  'proj-001': {
    totalBudget: 5000000,
    totalExpenses: 2350000,
    remainingBudget: 2650000,
    expenseCount: 45,
    profitLoss: 150000,
  },
  'proj-002': {
    totalBudget: 2500000,
    totalExpenses: 1200000,
    remainingBudget: 1300000,
    expenseCount: 28,
    profitLoss: 75000,
  },
  'proj-003': {
    totalBudget: 1500000,
    totalExpenses: 50000,
    remainingBudget: 1450000,
    expenseCount: 5,
    profitLoss: 0,
  },
  'proj-004': {
    totalBudget: 3000000,
    totalExpenses: 800000,
    remainingBudget: 2200000,
    expenseCount: 15,
    profitLoss: -50000,
  },
  'proj-005': {
    totalBudget: 15000000,
    totalExpenses: 9500000,
    remainingBudget: 5500000,
    expenseCount: 120,
    profitLoss: 500000,
  },
};

const MOCK_METADATA: Record<string, ProjectMetadata> = {
  'proj-001': {
    lastExpenseDate: '2024-06-15',
    supervisorCount: 3,
    documentCount: 25,
  },
  'proj-002': {
    lastExpenseDate: '2024-06-10',
    supervisorCount: 2,
    documentCount: 18,
  },
  'proj-003': {
    lastExpenseDate: '2024-06-01',
    supervisorCount: 1,
    documentCount: 8,
  },
  'proj-004': {
    lastExpenseDate: '2024-04-15',
    supervisorCount: 2,
    documentCount: 12,
  },
  'proj-005': {
    lastExpenseDate: '2024-06-18',
    supervisorCount: 5,
    documentCount: 85,
  },
};

// =====================================================
// ASYNC SIMULATION HELPER
// =====================================================

const simulateDelay = (ms: number = 500): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// =====================================================
// PROJECT SERVICE
// =====================================================

export const projectService = {
  /**
   * Get all projects
   */
  async getAllProjects(): Promise<Project[]> {
    await simulateDelay(800);
    return [...MOCK_PROJECTS];
  },

  /**
   * Get project by ID
   */
  async getProjectById(projectId: string): Promise<Project> {
    await simulateDelay(500);
    const project = MOCK_PROJECTS.find(p => p.id === projectId);
    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }
    return { ...project };
  },

  /**
   * Get project totals (budget, expenses, etc.)
   */
  async getProjectTotals(projectId: string): Promise<ProjectTotals> {
    await simulateDelay(300);
    const totals = MOCK_TOTALS[projectId];
    if (!totals) {
      return {
        totalBudget: 0,
        totalExpenses: 0,
        remainingBudget: 0,
        expenseCount: 0,
      };
    }
    return { ...totals };
  },

  /**
   * Get project metadata
   */
  async getProjectMetadata(projectId: string): Promise<ProjectMetadata> {
    await simulateDelay(200);
    const metadata = MOCK_METADATA[projectId];
    if (!metadata) {
      return {
        supervisorCount: 0,
        documentCount: 0,
      };
    }
    return { ...metadata };
  },

  /**
   * Search projects by name or description
   */
  async searchProjects(query: string): Promise<Project[]> {
    await simulateDelay(400);
    const lowerQuery = query.toLowerCase();
    return MOCK_PROJECTS.filter(
      p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    );
  },

  /**
   * Filter projects by status
   */
  async filterProjectsByStatus(status: ProjectStatus): Promise<Project[]> {
    await simulateDelay(300);
    return MOCK_PROJECTS.filter(p => p.status === status);
  },

  /**
   * Create a new project (mock)
   */
  async createProject(
    project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Project> {
    await simulateDelay(600);
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    MOCK_PROJECTS.push(newProject);
    return newProject;
  },

  /**
   * Update a project (mock)
   */
  async updateProject(
    projectId: string,
    updates: Partial<Project>
  ): Promise<Project> {
    await simulateDelay(500);
    const index = MOCK_PROJECTS.findIndex(p => p.id === projectId);
    if (index === -1) {
      throw new Error(`Project not found: ${projectId}`);
    }
    MOCK_PROJECTS[index] = {
      ...MOCK_PROJECTS[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return { ...MOCK_PROJECTS[index] };
  },

  /**
   * Delete a project (mock)
   */
  async deleteProject(projectId: string): Promise<void> {
    await simulateDelay(400);
    const index = MOCK_PROJECTS.findIndex(p => p.id === projectId);
    if (index === -1) {
      throw new Error(`Project not found: ${projectId}`);
    }
    MOCK_PROJECTS.splice(index, 1);
  },
};

export default projectService;
