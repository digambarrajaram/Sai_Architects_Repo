import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  SafeAreaView,
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
import { expenseService, BackendExpense } from '../services/expenseService';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { styles } from './styles/project-detail.styles';
// ─── Types ────────────────────────────────────────────────────────────────────

interface ExpenseWithStatus extends BackendExpense {
  status?: 'pending' | 'approved' | 'rejected';
}

type DateFilterType = 'daily' | 'weekly' | 'monthly' | 'all';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDateRange = (
  filterType: DateFilterType
): { start: Date | null; end: Date | null } => {
  if (filterType === 'all') return { start: null, end: null };

  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);

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

const safeFormatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

const FILTER_OPTIONS: { value: DateFilterType; label: string }[] = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProjectDetailSupervisorScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectDetailSupervisor'>>();
  const { projectId } = route.params;

  // ── State ────────────────────────────────────────────────────────────────────
  const [project, setProject] = useState<ProjectWithExpenses | null>(null);
  const [expenses, setExpenses] = useState<ExpenseWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('daily');

  // ── Data Fetching ─────────────────────────────────────────────────────────────

  const fetchProjectDetails = useCallback(async () => {
    const projectData = await projectService.getProjectById(projectId);
    if (!projectData) throw new Error('Project not found');
    setProject(projectData);
  }, [projectId]);

  const fetchExpenses = useCallback(async () => {
    const dateRange = getDateRange(dateFilter);
    const filters: Record<string, Date> = {};
    if (dateRange.start) filters.startDate = dateRange.start;
    if (dateRange.end) filters.endDate = dateRange.end;

    const data = await expenseService.getExpensesByProject(projectId, filters);

    // Map status for UI display (replace with real backend field when available)
    const withStatus: ExpenseWithStatus[] = data.map((exp, index) => ({
      ...exp,
      status:
        index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected',
    }));

    setExpenses(withStatus);
  }, [projectId, dateFilter]);

  const loadAll = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        await fetchProjectDetails();
        await fetchExpenses();
      } catch (err) {
        const msg =
          err instanceof ProjectServiceError
            ? err.message
            : (err as Error).message || 'Failed to load project details';
        setError(msg);

        if (__DEV__) {
          console.error('[ProjectDetailSupervisor] Error:', err);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [fetchProjectDetails, fetchExpenses]
  );

  // ── Auto-refresh on screen focus (also triggered after AddExpense navigate back) ──
  // FIX: Only fetch on first focus to prevent infinite loop
  const hasFetchedInitial = useRef(false);
  
  useFocusEffect(
    useCallback(() => {
      // Only load on first focus, not every time
      if (!hasFetchedInitial.current) {
        hasFetchedInitial.current = true;
        loadAll();
      }
      
      // Check and clear refresh param after load
      if (route.params?.refresh) {
        navigation.setParams({ refresh: undefined });
      }
    }, [loadAll, route.params, navigation])
  );

  // FIX: Handle filter changes - useEffect to trigger fetch when dateFilter changes
  useEffect(() => {
    // Skip initial mount (useFocusEffect handles that)
    const timer = setTimeout(() => {
      fetchExpenses();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [dateFilter, fetchExpenses]);

  // ── Correct total calculation ─────────────────────────────────────────────────
  const totalExpense = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount), 0),
    [expenses]
  );

  // ── Status helpers ────────────────────────────────────────────────────────────
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

  const getStatusText = useCallback(
    (status?: string) => (status || 'pending').toUpperCase(),
    []
  );

  const navigateToExpenseDetail = useCallback((expenseId: string) => {
    Alert.alert('Expense Details', `Viewing expense: ${expenseId}`, [
      { text: 'OK' },
    ]);
  }, []);

  // ── Render item ───────────────────────────────────────────────────────────────
  const renderExpenseItem = useCallback(
    ({ item }: { item: ExpenseWithStatus }) => (
      <Pressable
        style={styles.expenseItem}
        onPress={() => navigateToExpenseDetail(item.id)}
        android_ripple={{ color: '#e2e8f0' }}
      >
        <View style={[styles.expenseIcon, { backgroundColor: '#e2e8f0' }]} />
        <View style={{ flex: 1 }}>
          <View style={styles.expenseTop}>
            <Text numberOfLines={1} style={styles.expenseTitle}>
              {item.category}
            </Text>
            <Text style={styles.expenseAmount}>
              {formatCurrency(Number(item.amount))}
            </Text>
          </View>
          <View style={styles.expenseBottom}>
            <Text style={styles.expenseMeta}>
              {item.description ? `${item.description} • ` : ''}
              {safeFormatDate(item.expense_date)}
            </Text>
            <View style={[styles.statusPill, getStatusStyle(item.status)]}>
              <Text style={styles.statusPillText}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    ),
    [navigateToExpenseDetail, getStatusStyle, getStatusText]
  );

  const keyExtractor = useCallback(
    (item: ExpenseWithStatus) => item.id.toString(),
    []
  );

  // ── Loading / Error states ────────────────────────────────────────────────────
  if (loading) return <LoadingState />;

  if (error) {
    return <ErrorState message={error} onRetry={() => loadAll()} />;
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ flex: 1 }}>
        {/* ── Header ──────────────────────────────────────────────────────────── */}
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
            <Pressable style={styles.iconBtn}>
              <Text style={styles.headerIcon}>⋮</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Date Filter Bar ──────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={styles.filterBarContent}
        >
          {FILTER_OPTIONS.map((option) => (
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

        {/* ── Scrollable Body ──────────────────────────────────────────────────── */}
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadAll(true)}
              colors={['#136dec']}
              tintColor="#136dec"
            />
          }
        >
          {/* Project Card */}
          <View style={styles.card}>
            <Text style={styles.projectTitle}>
              {project?.name || 'Project'}
            </Text>
          </View>

          {/* Stats */}
          <View style={[styles.statsContainer, { flexDirection: 'row', gap: 12, marginBottom: 16 }]}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Expenses</Text>
              <Text style={styles.statValue}>{formatCurrency(totalExpense)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Count</Text>
              <Text style={styles.statValue}>{expenses.length}</Text>
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Expenses ({expenses.length})
            </Text>
          </View>

          {/* Empty State */}
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🧾</Text>
              <Text style={styles.emptyStateTitle}>No expenses recorded yet</Text>
              <Text style={styles.emptyStateText}>
                Tap the + button to add your first expense
              </Text>
            </View>
          ) : (
            <FlatList
              data={expenses}
              renderItem={renderExpenseItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.expenseListContainer}
            />
          )}
        </ScrollView>

        {/* ── FAB ─────────────────────────────────────────────────────────────── */}
        <Pressable
          style={styles.fab}
          onPress={() => navigation.navigate('AddExpense', { projectId })}
        >
          <Text style={styles.fabIcon}>＋</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
