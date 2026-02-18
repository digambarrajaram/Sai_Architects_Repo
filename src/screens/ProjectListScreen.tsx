import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
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
  const [allProjects, setAllProjects] = useState<ProjectWithExpenses[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<UIFilterOption>('All');
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
      const statusFilter = mapUIFilterToStatus(activeFilter);
      
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
        setAllProjects(data);
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
  }, [user?.id, activeFilter, searchQuery]);

  // Set up mounted ref and focus effect
  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      
      fetchProjects();
      
      return () => {
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
  const calculateProgress = useCallback((project: ProjectWithExpenses) => {
    if (!project.budget || project.budget === 0) return 0;
    const total = project.total_expenses || 0;
    return Math.min(Math.round((total / project.budget) * 100), 100);
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount: number = 0) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Get status badge color
  const getStatusBadgeStyle = useCallback((status: ProjectStatus) => {
    switch (status) {
      case 'active':
        return styles.badgeActive;
      case 'completed':
        return styles.badgeCompleted;
      case 'on_hold':
        return styles.badgeOnHold;
      case 'planning':
      default:
        return styles.badgePlanning;
    }
  }, []);

  // Render loading state
  if (loading && !refreshing && allProjects.length === 0) {
    return <LoadingState message="Loading projects..." />;
  }

  // Render error state
  if (error && allProjects.length === 0) {
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
          <Text style={styles.profileIcon}>👤</Text>
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

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        testID="project-list"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#136dec']}
            tintColor="#136dec"
          />
        }
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
      >
        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Search by project name..."
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
          <Pressable 
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
          </Pressable>
        </View>

        {/* Filter Chips */}
        {showFilters && (
          <View style={styles.filterChipsContainer}>
            {UI_FILTER_OPTIONS.map((filter) => (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.chip,
                  activeFilter === filter && styles.chipActive,
                ]}
                testID={`filter-${filter.toLowerCase().replace(' ', '-')}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    activeFilter === filter && styles.chipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Active Filter Summary */}
        {activeFilter !== 'All' && (
          <View style={styles.filterSummary}>
            <Text style={styles.filterSummaryText}>
              Filtered by: {activeFilter}
            </Text>
            <Pressable onPress={() => setActiveFilter('All')}>
              <Text style={styles.clearFilterText}>Clear</Text>
            </Pressable>
          </View>
        )}

        {/* Headline */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} testID="active-sites-title">
            {searchQuery ? 'Search Results' : 'All Projects'}
          </Text>
          <Text style={styles.sectionMeta}>
            {allProjects.length} {allProjects.length === 1 ? 'Project' : 'Projects'}
          </Text>
        </View>

        {/* Empty State */}
        {allProjects.length === 0 && !loading && (
          <EmptyState
            title="No Projects Yet"
            message="Create a new project to get started"
            icon="📁"
            testID="empty-projects"
          />
        )}

        {/* Project Cards */}
        {allProjects.map((project) => {
          const progress = calculateProgress(project);
          const displayStatus = getDisplayStatus(project.status);
          const statusBadgeStyle = getStatusBadgeStyle(project.status);

          return (
            <Pressable
              key={project.id}
              style={styles.card}
              onPress={() => handleProjectPress(project.id)}
              testID={`project-card-${project.id}`}
              android_ripple={{ color: '#e2e8f0' }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Text style={styles.cardTitle}>{project.name}</Text>
                  <Text style={styles.cardSub}>
                    ID: {project.id.slice(0, 8)}...
                  </Text>
                </View>
                <View style={[styles.badge, statusBadgeStyle]}>
                  <Text style={styles.badgeText}>
                    {displayStatus}
                  </Text>
                </View>
              </View>

              {isOwner && (
                <View style={styles.financials}>
                  <View>
                    <Text style={styles.label}>Total Spent</Text>
                    <Text style={styles.spent}>
                      {formatCurrency(project.total_expenses)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.label}>Budget</Text>
                    <Text style={styles.budget}>
                      {formatCurrency(project.budget)}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>{progress}%</Text>
                </View>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress}%` },
                      progress >= 90 && styles.progressFillWarning,
                    ]}
                  />
                </View>
              </View>
            </Pressable>
          );
        })}

        {/* Bottom padding */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        {isOwner ? (
          <>
            <Pressable
              style={styles.tabItem}
              testID="tab-Projects"
              onPress={() => navigation.navigate('ProjectList')}
            >
              <Text style={[styles.tabText, styles.tabActive]}>Projects</Text>
            </Pressable>
            <Pressable
              style={styles.tabItem}
              testID="tab-Reports"
              onPress={() => navigation.navigate('ProjectDashboard', {
                projectId: 'global',
              })}
            >
              <Text style={styles.tabText}>Reports</Text>
            </Pressable>
          </>
        ) : (
          <Pressable
            style={styles.tabItem}
            testID="tab-Projects"
            onPress={() => navigation.navigate('ProjectList')}
          >
            <Text style={[styles.tabText, styles.tabActive]}>Projects</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f6f7f8',
  },
  scrollView: {
    flex: 1,
  },
  content: { 
    padding: 16,
    paddingBottom: 120,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#0f172a',
  },
  profileIcon: { 
    fontSize: 24,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#136dec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: { 
    fontSize: 20, 
    color: '#fff',
    fontWeight: '600',
  },
  searchRow: { 
    flexDirection: 'row', 
    marginBottom: 12,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#0f172a',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#64748b',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#136dec',
  },
  filterIcon: {
    fontSize: 18,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipActive: { 
    backgroundColor: '#136dec',
    borderColor: '#136dec',
  },
  chipText: { 
    fontSize: 14, 
    color: '#334155',
    fontWeight: '500',
  },
  chipTextActive: { 
    color: '#fff', 
    fontWeight: '600',
  },
  filterSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filterSummaryText: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  clearFilterText: {
    fontSize: 14,
    color: '#136dec',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionMeta: { 
    fontSize: 14, 
    color: '#64748b',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardSub: { 
    fontSize: 12, 
    color: '#64748b',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgePlanning: {
    backgroundColor: '#e0edff',
  },
  badgeActive: {
    backgroundColor: '#d1fae5',
  },
  badgeCompleted: {
    backgroundColor: '#fef3c7',
  },
  badgeOnHold: {
    backgroundColor: '#fee2e2',
  },
  badgeText: { 
    fontSize: 11, 
    fontWeight: '600',
    color: '#0f172a',
  },
  financials: {
    marginTop: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  label: { 
    fontSize: 12, 
    color: '#64748b',
    marginBottom: 2,
  },
  spent: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#136dec',
  },
  budget: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#334155',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  progressPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  progressBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#136dec',
    borderRadius: 4,
  },
  progressFillWarning: {
    backgroundColor: '#f59e0b',
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingBottom: 8,
  },
  tabItem: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
  },
  tabText: { 
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  tabActive: { 
    color: '#136dec',
    fontWeight: '700',
  },
});