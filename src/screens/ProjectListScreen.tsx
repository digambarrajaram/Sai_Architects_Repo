import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserRole } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { projectService, ProjectWithExpenses, ProjectServiceError } from '../services/projectService';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { ProjectCard } from '../components/project/ProjectCard';
import { ProjectWithTotals } from '../types';
import { styles } from './styles/project-list.styles';

// Types
type ProjectStatus = 'active' | 'planning' | 'completed' | 'on_hold';
type UIFilterOption = 'All' | 'In Progress' | 'Planning' | 'Completed' | 'On Hold';

const UI_FILTER_OPTIONS: UIFilterOption[] = ['All', 'In Progress', 'Planning', 'Completed', 'On Hold'];

// Map UI filter to backend status
const mapUIFilterToStatus = (uiFilter: UIFilterOption): ProjectStatus | undefined => {
  const map: Record<UIFilterOption, ProjectStatus | undefined> = {
    'All': undefined,
    'In Progress': 'active',
    'Planning': 'planning',
    'Completed': 'completed',
    'On Hold': 'on_hold',
  };
  return map[uiFilter];
};

// Error message utility
const getErrorMessage = (error: unknown): string => {
  // Handle ProjectServiceError
  if (error instanceof ProjectServiceError) {
    return error.message;
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string error
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle object with message property
  if (error && typeof error === 'object') {
    // Check for Supabase error structure
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    // Check for error property
    if ('error' in error && typeof error.error === 'string') {
      return error.error;
    }
  }
  
  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

export default function ProjectListScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();

  // State
  const [projects, setProjects] = useState<ProjectWithTotals[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<UIFilterOption>('All');
  const [showFilters, setShowFilters] = useState(false);

  const isOwner = user?.role === UserRole.OWNER;
  const isMounted = useRef(true);

  // Fetch projects
  const fetchProjects = useCallback(async (isRefresh = false) => {
    // Don't fetch if component is unmounted
    if (!isMounted.current) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Convert UI filter to backend status
      const statusFilter = mapUIFilterToStatus(filterStatus);
      
      // Build filters for API
      const filters: {
        status?: string;
        search?: string;
      } = {};
      
      if (statusFilter) {
        filters.status = statusFilter;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const data = await projectService.getProjects(user?.id, filters);
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setProjects(data);
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMounted.current) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
      }
      
      // Development logging
      if (__DEV__) {
        console.group('[ProjectListScreen] Fetch Error');
        console.error('Error:', err);
        if (err && typeof err === 'object') {
          try {
            console.error('Error details:', JSON.stringify(err, null, 2));
          } catch {
            // Ignore circular reference errors
          }
        }
        console.groupEnd();
      }
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [user?.id, filterStatus, searchQuery]);

  const isInitialMount = useRef(true);
  
  // Handle filter/search change - refetch projects when filter or search changes
  // This enables real-time filtering without leaving the screen
  useEffect(() => {
    // Skip first run since useFocusEffect will handle initial fetch
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchProjects();
  }, [fetchProjects, filterStatus, searchQuery]);

  // Fetch projects when screen comes into focus (e.g., after creating a new project)
  useFocusEffect(
    useCallback(() => {
      // Reset mount state when screen gains focus
      isMounted.current = true;
      fetchProjects();
      
      return () => {
        // Mark as unmounted when screen loses focus
        isMounted.current = false;
      };
    }, [fetchProjects])
  );

  // Handle project press
  const handleProjectPress = useCallback((projectId: string) => {
    if (isOwner) {
      navigation.navigate('ProjectDetailOwner', { projectId });
    } else {
      navigation.navigate('ProjectDetailSupervisor', { projectId });
    }
  }, [isOwner, navigation]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchProjects(true);
  }, [fetchProjects]);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Calculate progress percentage
  const calculateProgress = useCallback((project: ProjectWithTotals) => {
    if (!project.budget || project.budget === 0) return 0;
    const total = project.total_expenses || 0;
    return Math.min(Math.round((total / project.budget) * 100), 100);
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  // Get display status for UI
  const getDisplayStatus = useCallback((status: ProjectStatus): string => {
    switch (status) {
      case 'active':
        return 'In Progress';
      case 'planning':
        return 'Planning';
      case 'completed':
        return 'Completed';
      case 'on_hold':
        return 'On Hold';
      default:
        return status;
    }
  }, []);

  // Render loading state
  if (loading && !refreshing && projects.length === 0) {
    return <LoadingState message="Loading projects..." />;
  }

  // Render error state
  if (error && projects.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={handleRetry}
        testID="projects-error-state"
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => navigation.navigate('Profile')} 
          testID="profile-btn"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
        </Pressable>
        <Text style={styles.headerTitle} testID="projects-title">Projects</Text>
        <Pressable 
          style={styles.addButton} 
          testID="add-project-btn"
          onPress={() => navigation.navigate('AddProject')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.addIcon}>＋</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search projects..."
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            testID="search-input"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Chips */}
      <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {UI_FILTER_OPTIONS.map((status) => (
          <Pressable
            key={status}
            style={[
              styles.filterChip,
              filterStatus === status && styles.filterChipActive
            ]}
            onPress={() => setFilterStatus(status)}
            testID={`filter-${status.toLowerCase().replace(' ', '-')}`}
          >
            <Text style={[
              styles.filterChipText,
              filterStatus === status && styles.filterChipTextActive
            ]}>
              {status}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      </View>

      {/* Project List */}
      <FlatList
        data={Array.from(new Map(
          (() => {
            let filtered = projects;
            // Apply status filter client-side as fallback
            if (filterStatus !== 'All') {
              const statusMap: Record<string, string> = {
                'In Progress': 'active',
                'Planning': 'planning',
                'Completed': 'completed',
                'On Hold': 'on_hold',
              };
              const status = statusMap[filterStatus] || filterStatus.toLowerCase().replace(' ', '_');
              filtered = filtered.filter(p => p.status === status);
            }
            // Apply search filter client-side
            if (searchQuery.trim()) {
              filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }
            return filtered;
          })().map(p => [p.id, p])
        ).values())}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard
            project={item}
            totals={{
              totalBudget: item.budget,
              totalExpenses: item.total_expenses || 0,
              remainingBudget: item.remaining_budget || item.budget,
              expenseCount: item.expense_count || 0,
            }}
            onPress={() => handleProjectPress(item.id)}
            showBudget={isOwner}
            showProgress
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchProjects(true)} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🏗️"
            title="No Projects Found"
            message={searchQuery ? "Try a different search term" : "Create your first project to get started"}
            testID="empty-projects"
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

