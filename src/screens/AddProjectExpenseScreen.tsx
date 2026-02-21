import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  expenseService,
  ExpenseServiceError,
  BackendExpenseCategory,
  BackendExpense,
} from '../services/expenseService';
import { auditLogService } from '../services/auditLogService';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { styles } from './styles/add-expense.styles';
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

// Filter type for expenses (similar to ProjectListScreen)
type CategoryFilterOption = 'All' | BackendExpenseCategory;

const CATEGORY_FILTER_OPTIONS: CategoryFilterOption[] = [
  'All',
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function AddProjectExpenseScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddExpense'>>();
  const { projectId } = route.params;
  const { user } = useAuth();
  const { showToast } = useToast();

  // Expense list state
  const [expenses, setExpenses] = useState<BackendExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<CategoryFilterOption>('All');
  const isMounted = useRef(true);

  // Form state
  const [amount, setAmount] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [category, setCategory] = useState<BackendExpenseCategory | null>(null);
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Date picker temp state
  const [tempDay, setTempDay] = useState(new Date().getDate());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());
  const [tempYear, setTempYear] = useState(new Date().getFullYear());

  // Fetch expenses
  const fetchExpenses = useCallback(async (isRefresh = false) => {
    if (!isMounted.current) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters: { categories?: BackendExpenseCategory[]; searchQuery?: string } = {};
      
      if (filterCategory !== 'All') {
        filters.categories = [filterCategory];
      }
      
      if (searchQuery.trim()) {
        filters.searchQuery = searchQuery.trim();
      }

      const data = await expenseService.getExpensesByProject(projectId, filters);
      
      if (isMounted.current) {
        setExpenses(data);
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[AddProjectExpenseScreen] Failed to fetch expenses:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [projectId, filterCategory, searchQuery]);

  // Initial fetch and refetch when filters change
  const hasFetched = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchExpenses();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Re-fetch when filters change (after initial mount)
  useEffect(() => {
    if (hasFetched.current) {
      fetchExpenses();
    }
  }, [filterCategory, searchQuery]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month + 1, 0).getDate();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const openDatePicker = () => {
    const current = new Date(expenseDate);
    setTempDay(current.getDate());
    setTempMonth(current.getMonth());
    setTempYear(current.getFullYear());
    setShowDatePicker(true);
  };

  const handleDateConfirm = () => {
    const daysInMonth = getDaysInMonth(tempMonth, tempYear);
    const validDay = Math.min(tempDay, daysInMonth);
    const dateStr = `${tempYear}-${String(tempMonth + 1).padStart(2, '0')}-${String(
      validDay
    ).padStart(2, '0')}`;
    setExpenseDate(dateStr);
    setShowDatePicker(false);
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    setValidationAttempted(true);
    if (!amount) {
      Alert.alert('Validation Error', 'Please enter an amount');
      return;
    }
    if (!category) {
      Alert.alert('Validation Error', 'Please select a category');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount');
      return;
    }

    setSubmitting(true);

    try {
      const expenseInput = {
        project_id: projectId,
        amount: parsedAmount,
        title: expenseTitle.trim() || undefined,
        category,
        description: notes || undefined,
        expense_date: expenseDate,
      };

      if (__DEV__) {
        console.log('[AddProjectExpenseScreen] Creating expense:', expenseInput);
      }

      const createdExpense = await expenseService.createExpenseDirect(
        expenseInput,
        user?.id
      );

      if (__DEV__) {
        console.log(
          '[AddProjectExpenseScreen] Expense created successfully:',
          createdExpense
        );
      }

      // Refresh the expense list
      fetchExpenses();

      // Audit log (non-blocking - won't fail expense creation if audit fails)
      if (user) {
        try {
          await auditLogService.logAction({
            projectId,
            userId: user.id,
            userName: user.name || 'Unknown',
            action: 'CREATE' as any,
            entity_type: 'EXPENSE' as any,
            entityId: createdExpense.id,
            details: `Created expense: ${category} - ${notes || 'No description'} (₹${parsedAmount})`,
            ipAddress: '192.168.1.100',
          });
        } catch (auditError) {
          // Log audit error but don't fail expense creation
          if (__DEV__) {
            console.warn('[AddProjectExpenseScreen] Audit log failed:', auditError);
          }
        }
      }

      // Navigate back to Project Details and signal a refresh
      showToast('Expense saved successfully!', 'success');
      navigation.goBack();
    } catch (error) {
      const errorMessage =
        error instanceof ExpenseServiceError
          ? error.message
          : 'Failed to add expense. Please try again.';

      if (__DEV__) {
        console.error('[AddProjectExpenseScreen] Failed to create expense:', error);
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Auto-refresh parent screen ──────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      const shouldRefresh = route.params?.refresh;
      
      if (shouldRefresh) {
        // Clear the refresh param to prevent infinite loop
        navigation.setParams({ refresh: undefined });
        // Trigger parent refresh by navigating back
        navigation.goBack();
      }
      
      // Cleanup function (optional but good practice)
      return () => {
        // Any cleanup code can go here
      };
    }, [navigation])
  );

  // Format currency
  const formatCurrency = useCallback((amount: number = 0) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  }, []);

  // Format date for display
  const formatExpenseDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchExpenses(true);
  }, [fetchExpenses]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
            testID="cancel-add-expense-btn"
            accessibilityLabel="Go back"
          >
            <Text style={styles.cancelText}>← Back</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Add Expense</Text>

          <View style={{ width: 64 }} />
        </View>

        {/* Scrollable Body */}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.divider} />
            {/* Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Amount</Text>
              <View style={styles.amountBox}>
                <Text style={styles.currency}>₹</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor="#cbd5e1"
                  keyboardType="decimal-pad"
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  testID="amount-input"
                />
              </View>
            </View>

            <View style={styles.divider} />

            {/* Category */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={[
                  styles.selectBox,
                  validationAttempted && !category && styles.selectBoxError,
                ]}
                testID="category-select"
                onPress={() => setShowCategoryModal(true)}
              >
                <Text
                  style={category ? styles.selectValue : styles.selectPlaceholder}
                >
                  {category || 'Select category'}
                </Text>
                <Text style={styles.expand}>⌄</Text>
              </Pressable>
              {validationAttempted && !category && (
                <Text style={styles.errorText}>Please select a category</Text>
              )}
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Date of Expense <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={styles.selectBox}
                testID="date-select"
                onPress={openDatePicker}
              >
                <Text style={styles.selectValue}>{formatDate(expenseDate)}</Text>
                <Text style={styles.expand}>📅</Text>
              </Pressable>
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>
                Notes / Description{' '}
                <Text style={styles.optional}>(Optional)</Text>
              </Text>
              <TextInput
                multiline
                placeholder="Add details about this expense..."
                placeholderTextColor="#94a3b8"
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
                testID="notes-input"
              />
            </View>
          </ScrollView>

          {/* Sticky Footer */}
          <View style={styles.footer}>
            <Pressable
              style={[
                styles.submitButton,
                (!amount || !category || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              testID="submit-expense-btn"
              accessibilityLabel="Submit expense"
              disabled={!amount || !category || submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? 'Saving...' : 'Save Expense'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Category Modal ─────────────────────────────────────────────────── */}
        <Modal
          visible={showCategoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowCategoryModal(false)}
          >
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <Pressable onPress={() => setShowCategoryModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
              </View>
              <ScrollView>
                {CATEGORIES.filter(cat => 
                  cat.toLowerCase().includes(categorySearch.toLowerCase())
                ).map((cat) => (
                  <Pressable
                    key={cat}
                    style={[
                      styles.modalOption,
                      category === cat && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      setCategory(cat);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        category === cat && styles.modalOptionTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                    {category === cat && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* ── Date Picker Modal ──────────────────────────────────────────────── */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
              </View>

              {/* Date Display */}
              <View style={datePickerStyles.dateDisplay}>
                <Text style={datePickerStyles.dateDisplayText}>
                  {MONTHS[tempMonth]} {tempDay}, {tempYear}
                </Text>
              </View>

              {/* Pickers */}
              <View style={datePickerStyles.pickerContainer}>
                {/* Month */}
                <View style={datePickerStyles.pickerColumn}>
                  <Text style={datePickerStyles.pickerLabel}>Month</Text>
                  <View style={datePickerStyles.pickerRow}>
                    <Pressable
                      style={datePickerStyles.arrowBtn}
                      onPress={() =>
                        setTempMonth((prev) => (prev - 1 + 12) % 12)
                      }
                    >
                      <Text style={datePickerStyles.arrowText}>◀</Text>
                    </Pressable>
                    <View style={datePickerStyles.valueContainer}>
                      <Text style={datePickerStyles.valueText}>
                        {MONTHS[tempMonth]}
                      </Text>
                    </View>
                    <Pressable
                      style={datePickerStyles.arrowBtn}
                      onPress={() =>
                        setTempMonth((prev) => (prev + 1) % 12)
                      }
                    >
                      <Text style={datePickerStyles.arrowText}>▶</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Day */}
                <View style={datePickerStyles.pickerColumn}>
                  <Text style={datePickerStyles.pickerLabel}>Day</Text>
                  <View style={datePickerStyles.pickerRow}>
                    <Pressable
                      style={datePickerStyles.arrowBtn}
                      onPress={() => {
                        const days = getDaysInMonth(tempMonth, tempYear);
                        setTempDay((prev) => ((prev - 2 + days) % days) + 1);
                      }}
                    >
                      <Text style={datePickerStyles.arrowText}>◀</Text>
                    </Pressable>
                    <View style={datePickerStyles.valueContainer}>
                      <Text style={datePickerStyles.valueText}>{tempDay}</Text>
                    </View>
                    <Pressable
                      style={datePickerStyles.arrowBtn}
                      onPress={() => {
                        const days = getDaysInMonth(tempMonth, tempYear);
                        setTempDay((prev) => (prev % days) + 1);
                      }}
                    >
                      <Text style={datePickerStyles.arrowText}>▶</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Year */}
                <View style={datePickerStyles.pickerColumn}>
                  <Text style={datePickerStyles.pickerLabel}>Year</Text>
                  <View style={datePickerStyles.pickerRow}>
                    <Pressable
                      style={datePickerStyles.arrowBtn}
                      onPress={() => setTempYear((prev) => prev - 1)}
                    >
                      <Text style={datePickerStyles.arrowText}>◀</Text>
                    </Pressable>
                    <View style={datePickerStyles.valueContainer}>
                      <Text style={datePickerStyles.valueText}>{tempYear}</Text>
                    </View>
                    <Pressable
                      style={datePickerStyles.arrowBtn}
                      onPress={() => setTempYear((prev) => prev + 1)}
                    >
                      <Text style={datePickerStyles.arrowText}>▶</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Confirm */}
              <Pressable
                style={datePickerStyles.confirmBtn}
                onPress={handleDateConfirm}
              >
                <Text style={datePickerStyles.confirmBtnText}>Confirm</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Date Picker Local Styles ─────────────────────────────────────────────────

const datePickerStyles = StyleSheet.create({
  dateDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dateDisplayText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  pickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  arrowText: {
    fontSize: 14,
    color: '#475569',
  },
  valueContainer: {
    paddingHorizontal: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  confirmBtn: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

// ─── Expense List Styles ─────────────────────────────────────────────────

const expenseListStyles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: '#94a3b8',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterRowContent: {
    paddingRight: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  filterChipText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  expenseInfo: {
    flex: 1,
    marginRight: 12,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 2,
  },
  expenseTitle: {
    fontSize: 15,
    color: '#1e293b',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
});
