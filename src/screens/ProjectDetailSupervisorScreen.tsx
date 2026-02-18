import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import {
  projectService,
  ProjectWithExpenses,
  ProjectServiceError,
} from '../services/projectService';
import {
  expenseService,
  BackendExpense,
} from '../services/expenseService';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

// Extended type with status
interface ExpenseWithStatus extends BackendExpense {
  status?: 'pending' | 'approved' | 'rejected';
}

type DateFilterType = 'daily' | 'weekly' | 'monthly' | 'all';

const getDateRange = (
  filterType: DateFilterType
): { start: Date | null; end: Date | null } => {
  if (filterType === 'all') {
    return { start: null, end: null };
  }

  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  let start = new Date(now);

  switch (filterType) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
  }

  return { start, end };
};

// Helper function to safely format date
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export default function ProjectDetailSupervisorScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectDetailSupervisor'>>();
  const { projectId } = route.params;

  const [project, setProject] = useState<ProjectWithExpenses | null>(null);
  const [allExpenses, setAllExpenses] = useState<ExpenseWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('daily');

  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const projectData = await projectService.getProjectById(projectId);

        if (!projectData) {
          setError('Project not found');
          return;
        }

        setProject(projectData);

        const dateRange = getDateRange(dateFilter);
        const filters: any = {};
        
        if (dateRange.start) filters.startDate = dateRange.start;
        if (dateRange.end) filters.endDate = dateRange.end;

        const expensesData = await expenseService.getExpensesByProject(
          projectId,
          filters
        );

        // Add mock status for demo purposes
        // In production, this would come from the backend
        const expensesWithStatus: ExpenseWithStatus[] = expensesData.map((exp, index) => ({
          ...exp,
          status: index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected',
        }));

        setAllExpenses(expensesWithStatus);
      } catch (err) {
        const errorMessage = err instanceof ProjectServiceError
          ? err.message
          : 'Failed to load project details';

        setError(errorMessage);
        
        if (__DEV__) {
          console.error('[ProjectDetailSupervisor] Error:', err);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [projectId, dateFilter]
  );

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const navigateToExpenseDetail = useCallback((expenseId: string) => {
    // Since ExpenseDetail might not be implemented yet
    Alert.alert(
      'Expense Details',
      `Viewing expense: ${expenseId}`,
      [{ text: 'OK' }]
    );
    // When implemented:
    // navigation.navigate('ExpenseDetail', { expenseId });
  }, []);

  const getStatusStyle = useCallback((status?: string) => {
    switch (status) {
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  }, []);

  const getStatusText = useCallback((status?: string): string => {
    return (status || 'pending').toUpperCase();
  }, []);

  const renderExpenseItem = useCallback(
    ({ item }: { item: ExpenseWithStatus }) => {
      return (
        <Pressable
          style={styles.expenseItem}
          onPress={() => navigateToExpenseDetail(item.id)}
          android_ripple={{ color: '#e2e8f0' }}
        >
          <View style={styles.expenseIcon} />
          <View style={{ flex: 1 }}>
            <View style={styles.expenseTop}>
              <Text numberOfLines={1} style={styles.expenseTitle}>
                {item.category}
              </Text>
              <Text style={styles.expenseAmount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
            <View style={styles.expenseBottom}>
              <Text style={styles.expenseMeta}>
                {item.description || 'No description'} •{' '}
                {formatDate(item.expense_date)}
              </Text>
              <View style={[styles.statusPill, getStatusStyle(item.status)]}>
                <Text style={styles.statusPillText}>
                  {getStatusText(item.status)}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [formatCurrency, getStatusStyle, getStatusText, navigateToExpenseDetail]
  );

  const keyExtractor = useCallback(
    (item: ExpenseWithStatus) => item.id.toString(),
    []
  );

  const filterOptions: { value: DateFilterType; label: string }[] = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'all', label: 'All Time' },
  ];

  // Calculate totals
  const totalAmount = useMemo(() => {
    return allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [allExpenses]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.headerIcon}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {project?.name || 'Project Details'}
        </Text>

        <View style={styles.headerRight}>
          <Pressable
            style={styles.iconBtn}
          >
            <Text style={styles.headerIcon}>⋮</Text>
          </Pressable>
        </View>
      </View>

      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        {filterOptions.map(option => (
          <Pressable
            key={option.value}
            style={[
              styles.filterChip,
              dateFilter === option.value && styles.filterChipActive,
            ]}
            onPress={() => setDateFilter(option.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                dateFilter === option.value && styles.filterChipTextActive,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchData(true)}
              colors={['#136dec']}
              tintColor="#136dec"
            />
          }
        >
          <View style={styles.card}>
            <Text style={styles.projectTitle}>
              {project?.name || 'Project'}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Expenses</Text>
              <Text style={styles.statValue}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Count</Text>
              <Text style={styles.statValue}>{allExpenses.length}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Expenses ({allExpenses.length})
            </Text>
          </View>

          {allExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>📊</Text>
              <Text style={styles.emptyStateTitle}>
                No expenses recorded yet
              </Text>
              <Text style={styles.emptyStateText}>
                Tap the + button to add your first expense
              </Text>
            </View>
          ) : (
            <FlatList
              data={allExpenses}
              renderItem={renderExpenseItem}
              keyExtractor={keyExtractor}
              scrollEnabled={false}
              contentContainerStyle={styles.expenseListContainer}
            />
          )}
        </ScrollView>

        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate('AddExpense', { projectId })}
        >
          <Text style={styles.fabIcon}>＋</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  filterBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#136dec',
    borderColor: '#136dec',
  },
  filterChipText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  projectTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#136dec',
  },
  sectionHeader: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  expenseItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  expenseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#136dec',
  },
  expenseBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseMeta: {
    fontSize: 13,
    color: '#64748b',
    flex: 1,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusApproved: {
    backgroundColor: '#d1fae5',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  expenseListContainer: {
    paddingBottom: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#136dec',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});