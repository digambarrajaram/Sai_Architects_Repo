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
            {/* Project Details */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>PROJECT DETAILS</Text>

              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>
                  Project ID: {projectId}
                </Text>
                <Text style={styles.lock}>🔒</Text>
              </View>
            </View>

            {/* Amount */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>AMOUNT</Text>

              <View style={styles.amountBox}>
                <Text style={styles.currency}>$</Text>
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
                onPress={() => setShowDatePicker(true)}
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

            {/* Receipt */}
            <View style={styles.field}>
              <Text style={styles.label}>Receipt</Text>
              <Pressable style={styles.uploadBox} testID="receipt-upload-btn" accessibilityLabel="Upload receipt">
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadIconText}>📷</Text>
                </View>
                <Text style={styles.uploadText}>Attach Receipt</Text>
              </Pressable>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Sticky Footer */}
          <View style={styles.footer}>
            <Pressable 
              style={[
                styles.submitBtn, 
                (!amount || !category) && styles.submitBtnDisabled
              ]} 
              onPress={handleSubmit} 
              testID="submit-expense-btn" 
              accessibilityLabel="Submit expense"
              disabled={!amount || !category}
            >
              <Text style={styles.submitText}>Submit Expense</Text>
              <Text style={styles.submitArrow}>→</Text>
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

        {/* Simple Date Picker Modal */}
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
              <View style={styles.dateDisplay}>
                <Text style={styles.currentDate}>{formatDate(expenseDate)}</Text>
              </View>
              <View style={styles.dateButtons}>
                <Pressable
                  style={[styles.dateButton, styles.dateButtonToday]}
                  onPress={() => {
                    setExpenseDate(new Date().toISOString().split('T')[0]);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.dateButtonText}>Today</Text>
                </Pressable>
                <Pressable
                  style={[styles.dateButton, styles.dateButtonYesterday]}
                  onPress={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setExpenseDate(yesterday.toISOString().split('T')[0]);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.dateButtonText}>Yesterday</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    paddingBottom: 140,
    flexGrow: 1,
  },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  cancelBtn: {
    padding: 8,
  },
  cancelText: {
    color: '#136dec',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },


  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8,
  },

  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  lock: {
    fontSize: 16,
    marginLeft: 8,
  },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    height: 80,
  },
  currency: {
    fontSize: 28,
    color: '#94a3b8',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: '#136dec',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 24,
    marginHorizontal: 16,
  },

  field: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginBottom: 6,
  },
  required: {
    color: '#dc2626',
  },
  optional: {
    fontWeight: '400',
    color: '#94a3b8',
  },

  selectBox: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectPlaceholder: {
    fontSize: 16,
    color: '#94a3b8',
  },
  selectValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  expand: {
    fontSize: 16,
    color: '#64748b',
  },

  textArea: {
    minHeight: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    padding: 16,
    fontSize: 16,
    color: '#0f172a',
    textAlignVertical: 'top',
  },

  uploadBox: {
    height: 96,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadIconText: {
    fontSize: 18,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f6f7f8',
  },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#136dec',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  submitArrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    borderBottomColor: '#f1f5f9',
  },
  modalOptionSelected: {
    backgroundColor: '#e0edff',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#0f172a',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: '#136dec',
  },
  checkmark: {
    fontSize: 16,
    color: '#136dec',
    fontWeight: '700',
  },

  // Date picker styles
  dateDisplay: {
    padding: 24,
    alignItems: 'center',
  },
  currentDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  dateButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  dateButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonToday: {
    backgroundColor: '#136dec',
  },
  dateButtonYesterday: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
