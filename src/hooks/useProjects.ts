// src/hooks/useProjects.ts
import { useState, useCallback } from 'react';
import { projectService, ProjectWithExpenses } from '../services/projectService';
import { useAsyncState } from './useAsyncState';

interface UseProjectsOptions {
  autoLoad?: boolean;
  filters?: {
    status?: string;
    search?: string;
  };
}

export function useProjects({ autoLoad = true, filters = {} }: UseProjectsOptions = {}) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'All');

  const {
    data: projects,
    loading,
    error,
    execute: loadProjects,
    setData: setProjects,
  } = useAsyncState<ProjectWithExpenses[]>({
    initialData: [],
  });

  const fetchProjects = useCallback(async (userId?: string) => {
    return loadProjects(() => 
      projectService.getProjects(userId, {
        search: searchQuery,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      })
    );
  }, [searchQuery, statusFilter, loadProjects]);

  const addProject = useCallback(async (projectData: any) => {
    try {
      const newProject = await projectService.createProject(projectData);
      const currentProjects = projects || [];
      setProjects([newProject as ProjectWithExpenses, ...currentProjects]);
      return newProject;
    } catch (error) {
      throw error;
    }
  }, [setProjects, projects]);

  const updateProject = useCallback(async (projectId: string, updates: any) => {
    try {
      const updated = await projectService.updateProject(projectId, updates);
      const currentProjects = projects || [];
      setProjects(currentProjects.map(proj => proj.id === projectId ? { ...proj, ...updated } : proj));
      return updated;
    } catch (error) {
      throw error;
    }
  }, [setProjects, projects]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      const currentProjects = projects || [];
      setProjects(currentProjects.filter(proj => proj.id !== projectId));
    } catch (error) {
      throw error;
    }
  }, [setProjects, projects]);

  const getProjectById = useCallback((projectId: string) => {
    return (projects || []).find(p => p.id === projectId);
  }, [projects]);

  const getTotalBudget = useCallback(() => {
    return (projects || []).reduce((sum, p) => sum + (p.budget || 0), 0);
  }, [projects]);

  const getTotalExpenses = useCallback(() => {
    return (projects || []).reduce((sum, p) => sum + (p.total_expenses || 0), 0);
  }, [projects]);

  return {
    projects: projects || [],
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
    getTotalBudget,
    getTotalExpenses,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  };
}