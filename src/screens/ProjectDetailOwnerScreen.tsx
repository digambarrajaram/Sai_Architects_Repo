import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Platform,
  LayoutAnimation,
  UIManager,
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
  BackendExpenseCategory,
} from '../services/expenseService';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { useAuth } from '../context/AuthContext';

// Simple debounce implementation to avoid lodash dependency
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Types
type DateFilterType = 'today' | 'week' | 'month' | 'custom' | 'all';
type SortOption = 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc' | 'category';
type ViewMode = 'list' | 'grid';
type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'all';

// Extended Expense type with status
interface ExtendedBackendExpense extends BackendExpense {
  status?: ExpenseStatus;
}

interface ExpenseFilters {
  startDate?: Date;
  endDate?: Date;
  categories?: BackendExpenseCategory[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
  status?: ExpenseStatus;
}

interface FilterState {
  dateRange: DateFilterType;
  customStartDate: Date | null;
  customEndDate: Date | null;
  categories: BackendExpenseCategory[];
  minAmount: string;
  maxAmount: string;
  searchQuery: string;
  status: ExpenseStatus;
  sortBy: SortOption;
  viewMode: ViewMode;
}

interface FilterChip {
  id: string;
  label: string;
  onRemove: () => void;
}

interface ExpenseStats {
  totalAmount: number;
  averageAmount: number;
  expenseCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

const CATEGORIES: BackendExpenseCategory[] = [
  'Materials',
  'Labor',
  'Machinery',
  'Transport',
  'Survey Equipment',
  'Permits',
  'Utilities',
  'Subcontractor',
  'Miscellaneous',
];

const DATE_FILTER_OPTIONS: { value: DateFilterType; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'custom', label: 'Custom Range' },
  { value: 'all', label: 'All Time' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'amount_desc', label: 'Highest Amount' },
  { value: 'amount_asc', label: 'Lowest Amount' },
  { value: 'category', label: 'Category' },
];

const STATUS_OPTIONS: { value: ExpenseStatus; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function ProjectDetailOwnerScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectDetailOwner'>>();
  const { projectId } = route.params;
  const { user } = useAuth();

  // State
  const [project, setProject] = useState<ProjectWithExpenses | null>(null);
  const [allExpenses, setAllExpenses] = useState<ExtendedBackendExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    dateRange: 'month',
    customStartDate: null,
    customEndDate: null,
    categories: [],
    minAmount: '',
    maxAmount: '',
    searchQuery: '',
    status: 'all',
    sortBy: 'date_desc',
    viewMode: 'list',
  });

  const [stats, setStats] = useState<ExpenseStats>({
    totalAmount: 0,
    averageAmount: 0,
    expenseCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  const searchInputRef = useRef<TextInput>(null);

  // Get date range based on filter
  const getDateRange = useCallback((): { start: Date | null; end: Date | null } => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start: Date | null = new Date(now);

    switch (filters.dateRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'custom':
        return {
          start: filters.customStartDate,
          end: filters.customEndDate,
        };
      case 'all':
        start = null;
        break;
    }

    return { start, end: filters.dateRange === 'all' ? null : end };
  }, [filters.dateRange, filters.customStartDate, filters.customEndDate]);

  // Build filters for API
  const buildExpenseFilters = useCallback((): ExpenseFilters => {
    const dateRange = getDateRange();
    const apiFilters: ExpenseFilters = {};

    if (dateRange.start) {
      apiFilters.startDate = dateRange.start;
    }
    if (dateRange.end) {
      apiFilters.endDate = dateRange.end;
    }
    
    // Get categories from component state (FilterState)
    if (filters.categories && filters.categories.length > 0) {
      apiFilters.categories = filters.categories;
    }
    
    // Parse minAmount from string (FilterState) to number (ExpenseFilters)
    if (filters.minAmount) {
      const minAmount = parseFloat(filters.minAmount);
      if (!isNaN(minAmount)) {
        apiFilters.minAmount = minAmount;
      }
    }
    
    // Parse maxAmount from string (FilterState) to number (ExpenseFilters)
    if (filters.maxAmount) {
      const maxAmount = parseFloat(filters.maxAmount);
      if (!isNaN(maxAmount)) {
        apiFilters.maxAmount = maxAmount;
      }
    }
    
    if (filters.searchQuery) {
      apiFilters.searchQuery = filters.searchQuery;
    }
    
    if (filters.status !== 'all') {
      apiFilters.status = filters.status;
    }

    return apiFilters;
  }, [filters, getDateRange]);

  // Fetch data
  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        // Fetch project details
        const projectData = await projectService.getProjectById(projectId);
        if (!projectData) {
          setError('Project not found');
          return;
        }
        setProject(projectData);

        // Fetch expenses with filters
        const expenseFilters = buildExpenseFilters();
        const expensesData = await expenseService.getExpensesByProject(
          projectId,
          expenseFilters
        );

        // Add mock status for demo (in real app, this would come from backend)
        const expensesWithStatus: ExtendedBackendExpense[] = expensesData.map((exp, index) => ({
          ...exp,
          status: index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected',
        }));

        setAllExpenses(expensesWithStatus);

        // Calculate stats
        const total = expensesWithStatus.reduce((sum, exp) => sum + exp.amount, 0);
        const pending = expensesWithStatus.filter(exp => exp.status === 'pending').length;
        const approved = expensesWithStatus.filter(exp => exp.status === 'approved').length;
        const rejected = expensesWithStatus.filter(exp => exp.status === 'rejected').length;

        setStats({
          totalAmount: total,
          averageAmount: expensesWithStatus.length > 0 ? total / expensesWithStatus.length : 0,
          expenseCount: expensesWithStatus.length,
          pendingCount: pending,
          approvedCount: approved,
          rejectedCount: rejected,
        });
      } catch (err) {
        const errorMessage = err instanceof ProjectServiceError
          ? err.message
          : 'Failed to load project details';
        setError(errorMessage);
        
        if (__DEV__) {
          console.error('[ProjectDetailOwner] Error:', err);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [projectId, buildExpenseFilters]
  );

  // Debounced search
// Add this ref at the top of your component with other refs
const searchTimeoutRef = useRef<NodeJS.Timeout>();

// Replace your current debouncedFetch with this:
const debouncedFetch = useCallback(() => {
  if (searchTimeoutRef.current) {
    clearTimeout(searchTimeoutRef.current);
  }
  
  searchTimeoutRef.current = setTimeout(() => {
    fetchData();
  }, 500);
}, [fetchData]);

// Update your useEffect cleanup:
useEffect(() => {
  if (!loading) {
    debouncedFetch();
  }
  
  return () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };
}, [filters.categories, filters.dateRange, filters.minAmount, filters.maxAmount, filters.status, filters.searchQuery]);  // Focus effect
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Sort expenses
  const sortedExpenses = useMemo(() => {
    const sorted = [...allExpenses];
    
    switch (filters.sortBy) {
      case 'date_desc':
        return sorted.sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime());
      case 'date_asc':
        return sorted.sort((a, b) => new Date(a.expense_date).getTime() - new Date(b.expense_date).getTime());
      case 'amount_desc':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'amount_asc':
        return sorted.sort((a, b) => a.amount - b.amount);
      case 'category':
        return sorted.sort((a, b) => a.category.localeCompare(b.category));
      default:
        return sorted;
    }
  }, [allExpenses, filters.sortBy]);

  // Get active filter chips
  const activeFilterChips = useMemo((): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (filters.dateRange !== 'all' && filters.dateRange !== 'custom') {
      const option = DATE_FILTER_OPTIONS.find(opt => opt.value === filters.dateRange);
      if (option) {
        chips.push({
          id: 'dateRange',
          label: `Date: ${option.label}`,
          onRemove: () => setFilters(prev => ({ ...prev, dateRange: 'all' })),
        });
      }
    }

    if (filters.customStartDate && filters.customEndDate) {
      chips.push({
        id: 'customDate',
        label: `Custom Date Range`,
        onRemove: () => setFilters(prev => ({ 
          ...prev, 
          customStartDate: null, 
          customEndDate: null,
          dateRange: 'all' 
        })),
      });
    }

    filters.categories.forEach(cat => {
      chips.push({
        id: `cat-${cat}`,
        label: cat,
        onRemove: () => setFilters(prev => ({
          ...prev,
          categories: prev.categories.filter(c => c !== cat),
        })),
      });
    });

    if (filters.minAmount) {
      chips.push({
        id: 'minAmount',
        label: `Min: ₹${filters.minAmount}`,
        onRemove: () => setFilters(prev => ({ ...prev, minAmount: '' })),
      });
    }

    if (filters.maxAmount) {
      chips.push({
        id: 'maxAmount',
        label: `Max: ₹${filters.maxAmount}`,
        onRemove: () => setFilters(prev => ({ ...prev, maxAmount: '' })),
      });
    }

    if (filters.status !== 'all') {
      const option = STATUS_OPTIONS.find(opt => opt.value === filters.status);
      if (option) {
        chips.push({
          id: 'status',
          label: `Status: ${option.label}`,
          onRemove: () => setFilters(prev => ({ ...prev, status: 'all' })),
        });
      }
    }

    if (filters.searchQuery) {
      chips.push({
        id: 'search',
        label: `Search: "${filters.searchQuery}"`,
        onRemove: () => {
          setFilters(prev => ({ ...prev, searchQuery: '' }));
          fetchData();
        },
      });
    }

    return chips;
  }, [filters, fetchData]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFilters({
      dateRange: 'all',
      customStartDate: null,
      customEndDate: null,
      categories: [],
      minAmount: '',
      maxAmount: '',
      searchQuery: '',
      status: 'all',
      sortBy: 'date_desc',
      viewMode: 'list',
    });
    fetchData();
  }, [fetchData]);

  // Handle view mode toggle
  const toggleViewMode = useCallback(() => {
    setFilters((prev: FilterState) => ({
      ...prev,
      viewMode: prev.viewMode === 'list' ? 'grid' : 'list'
    }));
  }, []);

  // Handle custom date range selection
  const handleCustomDateSelect = useCallback(() => {
    if (tempStartDate && tempEndDate) {
      setFilters((prev: FilterState) => ({
        ...prev,
        dateRange: 'custom',
        customStartDate: tempStartDate,
        customEndDate: tempEndDate,
      }));
      setShowDatePickerModal(false);
      setTempStartDate(null);
      setTempEndDate(null);
    }
  }, [tempStartDate, tempEndDate]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Navigate to expense detail
  const navigateToExpenseDetail = useCallback((expenseId: number) => {
    // Convert number to string for navigation
    const expenseIdString = expenseId.toString();
    
    // Since ExpenseDetail might not be implemented yet, show alert
    Alert.alert(
      'Expense Details',
      `Viewing expense: ${expenseIdString}`,
      [
        { text: 'OK' }
      ]
    );
    // When implemented, use:
    // navigation.navigate('ExpenseDetail', { expenseId: expenseIdString });
  }, []);

  // Get status style
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

  // Get status text
  const getStatusText = useCallback((status?: string): string => {
    return (status || 'pending').toUpperCase();
  }, []);

 // Render expense item (list view)
const renderExpenseItem = useCallback(({ item }: { item: ExtendedBackendExpense }) => {
  return (
    <Pressable
      style={styles.expenseItem}
      onPress={() => {
        const expenseId = parseInt(item.id, 10);
        if (!isNaN(expenseId)) {
          navigateToExpenseDetail(expenseId);
        }
      }}
      android_ripple={{ color: '#e2e8f0' }}
    >
      <View style={[styles.expenseIcon, { backgroundColor: getCategoryColor(item.category) }]}>
        <Text style={styles.expenseIconText}>{getCategoryEmoji(item.category)}</Text>
      </View>
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
            {new Date(item.expense_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
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
}, [formatCurrency, getStatusStyle, getStatusText, navigateToExpenseDetail]);

// Render grid item
const renderGridItem = useCallback(({ item }: { item: ExtendedBackendExpense }) => {
  return (
    <Pressable
      style={styles.gridItem}
      onPress={() => {
        const expenseId = parseInt(item.id, 10);
        if (!isNaN(expenseId)) {
          navigateToExpenseDetail(expenseId);
        }
      }}
    >
      <View style={[styles.gridIcon, { backgroundColor: getCategoryColor(item.category) }]}>
        <Text style={styles.gridIconText}>{getCategoryEmoji(item.category)}</Text>
      </View>
      <Text numberOfLines={1} style={styles.gridCategory}>
        {item.category}
      </Text>
      <Text style={styles.gridAmount}>{formatCurrency(item.amount)}</Text>
      <View style={[styles.gridStatus, getStatusStyle(item.status)]}>
        <Text style={styles.gridStatusText}>
          {item.status ? item.status.charAt(0).toUpperCase() : 'P'}
        </Text>
      </View>
    </Pressable>
  );
}, [formatCurrency, getStatusStyle, navigateToExpenseDetail]);
  // Helper functions
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Materials': '#f87171',
      'Labor': '#60a5fa',
      'Machinery': '#fbbf24',
      'Transport': '#34d399',
      'Survey Equipment': '#a78bfa',
      'Permits': '#f472b6',
      'Utilities': '#6ee7b7',
      'Subcontractor': '#fca5a5',
      'Miscellaneous': '#94a3b8',
    };
    return colors[category] || '#94a3b8';
  };

  const getCategoryEmoji = (category: string): string => {
    const emojis: Record<string, string> = {
      'Materials': '📦',
      'Labor': '👷',
      'Machinery': '🚜',
      'Transport': '🚚',
      'Survey Equipment': '📐',
      'Permits': '📋',
      'Utilities': '💡',
      'Subcontractor': '🤝',
      'Miscellaneous': '📌',
    };
    return emojis[category] || '📌';
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
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

        <View style={styles.headerActions}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={[styles.headerIcon, showFilters && styles.activeFilterIcon]}>
              ⚙️
            </Text>
            {activeFilterChips.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFilterChips.length}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={toggleViewMode}
          >
            <Text style={styles.headerIcon}>
              {filters.viewMode === 'list' ? '📱' : '📲'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search expenses..."
            value={filters.searchQuery}
            onChangeText={(text: string) => {
              setFilters((prev: FilterState) => ({ ...prev, searchQuery: text }));
              debouncedFetch();
            }}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {filters.searchQuery ? (
            <Pressable
              onPress={() => {
                setFilters((prev: FilterState) => ({ ...prev, searchQuery: '' }));
                fetchData();
              }}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsContainer}
      >
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.totalAmount)}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Count</Text>
          <Text style={styles.statValue}>{stats.expenseCount}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>{formatCurrency(stats.averageAmount)}</Text>
        </View>
        <View style={[styles.statCard, styles.statPending]}>
          <Text style={styles.statLabel}>Pending</Text>
          <Text style={styles.statValue}>{stats.pendingCount}</Text>
        </View>
        <View style={[styles.statCard, styles.statApproved]}>
          <Text style={styles.statLabel}>Approved</Text>
          <Text style={styles.statValue}>{stats.approvedCount}</Text>
        </View>
        <View style={[styles.statCard, styles.statRejected]}>
          <Text style={styles.statLabel}>Rejected</Text>
          <Text style={styles.statValue}>{stats.rejectedCount}</Text>
        </View>
      </ScrollView>

      {/* Filter Chips */}
      {activeFilterChips.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chipContainer}
        >
          {activeFilterChips.map(chip => (
            <View key={chip.id} style={styles.chip}>
              <Text style={styles.chipText}>{chip.label}</Text>
              <Pressable onPress={chip.onRemove} hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                <Text style={styles.chipRemove}>✕</Text>
              </Pressable>
            </View>
          ))}
          {activeFilterChips.length > 1 && (
            <Pressable onPress={clearAllFilters}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </Pressable>
          )}
        </ScrollView>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date Range */}
            <Text style={styles.filterSectionTitle}>Date Range</Text>
            <View style={styles.filterOptions}>
              {DATE_FILTER_OPTIONS.map(option => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.filterChip,
                    filters.dateRange === option.value && styles.filterChipSelected,
                  ]}
                  onPress={() => {
                    if (option.value === 'custom') {
                      setShowDatePickerModal(true);
                    } else {
                      setFilters((prev: FilterState) => ({ ...prev, dateRange: option.value }));
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.dateRange === option.value && styles.filterChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Categories */}
            <View style={styles.filterRow}>
              <Text style={styles.filterSectionTitle}>Categories</Text>
              <Pressable onPress={() => setShowCategoryModal(true)}>
                <Text style={styles.editLink}>
                  {filters.categories.length > 0 ? 'Edit' : 'Select'}
                </Text>
              </Pressable>
            </View>
            {filters.categories.length > 0 ? (
              <View style={styles.filterOptions}>
                {filters.categories.map(cat => (
                  <View key={cat} style={styles.selectedCategory}>
                    <Text style={styles.selectedCategoryText}>{cat}</Text>
                    <Pressable
                      onPress={() => setFilters((prev: FilterState) => ({
                        ...prev,
                        categories: prev.categories.filter(c => c !== cat),
                      }))}
                    >
                      <Text style={styles.removeIcon}>✕</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.placeholderText}>All categories</Text>
            )}

            {/* Amount Range */}
            <Text style={styles.filterSectionTitle}>Amount Range (₹)</Text>
            <View style={styles.amountRange}>
              <TextInput
                style={styles.amountInput}
                placeholder="Min"
                keyboardType="numeric"
                value={filters.minAmount}
                onChangeText={(text: string) => setFilters((prev: FilterState) => ({ ...prev, minAmount: text }))}
              />
              <Text style={styles.amountSeparator}>-</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="Max"
                keyboardType="numeric"
                value={filters.maxAmount}
                onChangeText={(text: string) => setFilters((prev: FilterState) => ({ ...prev, maxAmount: text }))}
              />
            </View>

            {/* Status */}
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterOptions}>
              {STATUS_OPTIONS.map(option => (
                <Pressable
                  key={option.value}
                  style={[
                    styles.filterChip,
                    filters.status === option.value && styles.filterChipSelected,
                  ]}
                  onPress={() => setFilters((prev: FilterState) => ({ ...prev, status: option.value }))}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filters.status === option.value && styles.filterChipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Sort Options */}
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <Pressable style={styles.sortSelector} onPress={() => setShowSortModal(true)}>
              <Text style={styles.sortSelectorText}>
                {SORT_OPTIONS.find(opt => opt.value === filters.sortBy)?.label}
              </Text>
              <Text style={styles.chevron}>⌄</Text>
            </Pressable>

            {/* Apply Button */}
            <Pressable style={styles.applyButton} onPress={() => setShowFilters(false)}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        {sortedExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📊</Text>
            <Text style={styles.emptyStateTitle}>No expenses found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your filters or add a new expense
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedExpenses}
            renderItem={filters.viewMode === 'list' ? renderExpenseItem : renderGridItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={filters.viewMode === 'grid' ? 2 : 1}
            key={filters.viewMode} // Force re-render when view mode changes
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
            }
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.resultCount}>
                  Showing {sortedExpenses.length} expense{sortedExpenses.length !== 1 ? 's' : ''}
                </Text>
              </View>
            }
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
        )}
      </View>

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense', { projectId })}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>

      {/* Sort Modal */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <Pressable onPress={() => setShowSortModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            {SORT_OPTIONS.map(option => (
              <Pressable
                key={option.value}
                style={[
                  styles.modalOption,
                  filters.sortBy === option.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setFilters((prev: FilterState) => ({ ...prev, sortBy: option.value }));
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    filters.sortBy === option.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {filters.sortBy === option.value && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Category Selection Modal */}
      <Modal visible={showCategoryModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Categories</Text>
              <Pressable onPress={() => setShowCategoryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <ScrollView>
              {CATEGORIES.map(cat => (
                <Pressable
                  key={cat}
                  style={[
                    styles.modalOption,
                    filters.categories.includes(cat) && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setFilters((prev: FilterState) => ({
                      ...prev,
                      categories: prev.categories.includes(cat)
                        ? prev.categories.filter(c => c !== cat)
                        : [...prev.categories, cat],
                    }));
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      filters.categories.includes(cat) && styles.modalOptionTextSelected,
                    ]}
                  >
                    {cat}
                  </Text>
                  {filters.categories.includes(cat) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalApplyButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.modalApplyText}>Apply ({filters.categories.length})</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Date Picker Modal */}
      <Modal visible={showDatePickerModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePickerModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <Pressable onPress={() => setShowDatePickerModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>
            <View style={styles.datePickerContainer}>
              <Text style={styles.datePickerLabel}>Start Date</Text>
              <Pressable
                style={styles.datePickerButton}
                onPress={() => {
                  // In a real app, you'd use a proper date picker
                  const date = new Date();
                  setTempStartDate(date);
                }}
              >
                <Text style={styles.datePickerButtonText}>
                  {tempStartDate ? tempStartDate.toLocaleDateString() : 'Select Start Date'}
                </Text>
              </Pressable>

              <Text style={styles.datePickerLabel}>End Date</Text>
              <Pressable
                style={styles.datePickerButton}
                onPress={() => {
                  // In a real app, you'd use a proper date picker
                  const date = new Date();
                  setTempEndDate(date);
                }}
              >
                <Text style={styles.datePickerButtonText}>
                  {tempEndDate ? tempEndDate.toLocaleDateString() : 'Select End Date'}
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.datePickerApply,
                  (!tempStartDate || !tempEndDate) && styles.datePickerApplyDisabled,
                ]}
                onPress={handleCustomDateSelect}
                disabled={!tempStartDate || !tempEndDate}
              >
                <Text style={styles.datePickerApplyText}>Apply Date Range</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
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
  headerActions: {
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
  headerIcon: {
    fontSize: 20,
  },
  activeFilterIcon: {
    opacity: 0.7,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0f172a',
    padding: 0,
  },
  clearIcon: {
    fontSize: 16,
    color: '#64748b',
    padding: 4,
  },
  statsScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  statsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statPending: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  statApproved: {
    backgroundColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },
  statRejected: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  chipScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  chipContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    color: '#334155',
  },
  chipRemove: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
    paddingVertical: 6,
  },
  filtersPanel: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    maxHeight: 400,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipSelected: {
    backgroundColor: '#136dec',
    borderColor: '#136dec',
  },
  filterChipText: {
    fontSize: 13,
    color: '#334155',
  },
  filterChipTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  editLink: {
    fontSize: 13,
    color: '#136dec',
    fontWeight: '600',
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0edff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  selectedCategoryText: {
    fontSize: 13,
    color: '#136dec',
    fontWeight: '500',
  },
  removeIcon: {
    fontSize: 12,
    color: '#136dec',
    fontWeight: '600',
  },
  placeholderText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  amountRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amountInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#f8fafc',
  },
  amountSeparator: {
    fontSize: 16,
    color: '#64748b',
  },
  sortSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
  },
  sortSelectorText: {
    fontSize: 14,
    color: '#0f172a',
  },
  chevron: {
    fontSize: 16,
    color: '#64748b',
  },
  applyButton: {
    backgroundColor: '#136dec',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    color: '#64748b',
  },
  expenseItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseIconText: {
    fontSize: 24,
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
  gridItem: {
    flex: 1,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    aspectRatio: 1,
    alignItems: 'center',
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridIconText: {
    fontSize: 20,
  },
  gridCategory: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 4,
  },
  gridAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#136dec',
  },
  gridStatus: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalClose: {
    fontSize: 20,
    color: '#64748b',
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#e0edff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#334155',
  },
  modalOptionTextSelected: {
    color: '#136dec',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#136dec',
    fontWeight: '700',
  },
  modalApplyButton: {
    backgroundColor: '#136dec',
    padding: 16,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  modalApplyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerContainer: {
    padding: 16,
  },
  datePickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 8,
    marginTop: 16,
  },
  datePickerButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  datePickerButtonText: {
    fontSize: 14,
    color: '#0f172a',
  },
  datePickerApply: {
    backgroundColor: '#136dec',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  datePickerApplyDisabled: {
    backgroundColor: '#94a3b8',
  },
  datePickerApplyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});