import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { expenseService, ExpenseServiceError, BackendExpenseCategory } from '../services/expenseService';
import { auditLogService } from '../services/auditLogService';
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AddProjectExpenseScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddExpense'>>();
  const { projectId } = route.params;
  const { user } = useAuth();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<BackendExpenseCategory | null>(null);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Date picker state
  const [tempDay, setTempDay] = useState(new Date().getDate());
  const [tempMonth, setTempMonth] = useState(new Date().getMonth());
  const [tempYear, setTempYear] = useState(new Date().getFullYear());

  const handleSubmit = async () => {
    if (!amount || !category) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid positive amount');
      return;
    }

    setSubmitting(true);

    try {
      // Create expense using the expense service
      const expenseInput = {
        project_id: projectId,
        amount: parsedAmount,
        category: category,
        description: notes || undefined,
        expense_date: expenseDate,
      };

      if (__DEV__) {
        console.log('[AddProjectExpenseScreen] Creating expense:', expenseInput);
      }

      // Use createExpenseDirect which works with both mock mode and Supabase
      const createdExpense = await expenseService.createExpenseDirect(expenseInput, user?.id);

      if (__DEV__) {
        console.log('[AddProjectExpenseScreen] Expense created successfully:', createdExpense);
      }

      // Log the action
      if (user) {
        await auditLogService.logAction({
          projectId,
          userId: user.id,
          userName: user.name || 'Unknown',
          action: 'CREATE' as any,
          entityType: 'EXPENSE' as any,
          entityId: createdExpense.id,
          details: `Created expense: ${category} - ${notes || 'No description'} (₹${parsedAmount})`,
          ipAddress: '192.168.1.100', // In production, get from device
        });
      }

      // Debug: Log the expense data structure
      if (__DEV__) {
        console.log('[AddProjectExpenseScreen] Created expense details:', {
          id: createdExpense.id,
          project_id: createdExpense.project_id,
          amount: createdExpense.amount,
          category: createdExpense.category,
          expense_date: createdExpense.expense_date,
          created_by: createdExpense.created_by,
          created_at: createdExpense.created_at,
        });
      }

      // Navigate back to project details screen immediately after successful creation
      // The useFocusEffect in ProjectDetailSupervisorScreen will refresh the data
      navigation.goBack();
    } catch (error) {
      const errorMessage = error instanceof ExpenseServiceError
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleDateConfirm = () => {
    const daysInMonth = getDaysInMonth(tempMonth, tempYear);
    const validDay = Math.min(tempDay, daysInMonth);
    const dateStr = `${tempYear}-${String(tempMonth + 1).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
    setExpenseDate(dateStr);
    setShowDatePicker(false);
  };

  const openDatePicker = () => {
    const currentDate = new Date(expenseDate);
    setTempDay(currentDate.getDate());
    setTempMonth(currentDate.getMonth());
    setTempYear(currentDate.getFullYear());
    setShowDatePicker(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Top App Bar */}
        <View style={styles.header}>
          <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()} testID="cancel-add-expense-btn" accessibilityLabel="Cancel add expense">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Add Expense</Text>

          <View style={{ width: 64 }} />
        </View>

        {/* Scrollable Content */}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {/* Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>AMOUNT</Text>

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
              <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
              <Pressable 
                style={styles.selectBox} 
                testID="category-select"
                onPress={() => setShowCategoryModal(true)}
              >
                <Text style={category ? styles.selectValue : styles.selectPlaceholder}>
                  {category || 'Select category'}
                </Text>
                <Text style={styles.expand}>⌄</Text>
              </Pressable>
            </View>

            {/* Date */}
            <View style={styles.field}>
              <Text style={styles.label}>Date of Expense <Text style={styles.required}>*</Text></Text>
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
                Notes / Description <Text style={styles.optional}>(Optional)</Text>
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

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Sticky Footer */}
          <View style={styles.footer}>
            <Pressable 
              style={[
                styles.submitButton, 
                (!amount || !category) && styles.submitButtonDisabled
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

        {/* Category Selection Modal */}
        <Modal
          visible={showCategoryModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowCategoryModal(false)}>
            <Pressable style={styles.modalContent} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <Pressable onPress={() => setShowCategoryModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
              </View>
              <ScrollView>
                {CATEGORIES.map((cat) => (
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

        {/* Full Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
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

              {/* Date Pickers */}
              <View style={datePickerStyles.pickerContainer}>
                {/* Month Selector */}
                <View style={datePickerStyles.pickerColumn}>
                  <Text style={datePickerStyles.pickerLabel}>Month</Text>
                  <View style={datePickerStyles.pickerRow}>
                    <Pressable 
                      style={datePickerStyles.arrowBtn}
                      onPress={() => setTempMonth((prev) => (prev - 1 + 12) % 12)}
                    >
                      <Text style={datePickerStyles.arrowText}>◀</Text>
                    </Pressable>
                    <View style={datePickerStyles.valueContainer}>
                      <Text style={datePickerStyles.valueText}>{MONTHS[tempMonth]}</Text>
                    </View>
                    <Pressable 
                      style={datePickerStyles.arrowBtn}
                      onPress={() => setTempMonth((prev) => (prev + 1) % 12)}
                    >
                      <Text style={datePickerStyles.arrowText}>▶</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Day Selector */}
                <View style={datePickerStyles.pickerColumn}>
                  <Text style={datePickerStyles.pickerLabel}>Day</Text>
                  <View style={datePickerStyles.pickerRow}>
                    <Pressable 
                      style={datePickerStyles.arrowBtn}
                      onPress={() => {
                        const daysInMonth = getDaysInMonth(tempMonth, tempYear);
                        setTempDay((prev) => (prev - 1 + daysInMonth - 1) % daysInMonth + 1);
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
                        const daysInMonth = getDaysInMonth(tempMonth, tempYear);
                        setTempDay((prev) => prev % daysInMonth + 1);
                      }}
                    >
                      <Text style={datePickerStyles.arrowText}>▶</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Year Selector */}
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

              {/* Confirm Button */}
              <Pressable style={datePickerStyles.confirmBtn} onPress={handleDateConfirm}>
                <Text style={datePickerStyles.confirmBtnText}>Confirm</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
