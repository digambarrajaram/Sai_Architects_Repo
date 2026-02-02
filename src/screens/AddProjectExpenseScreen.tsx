import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

export default function AddProjectExpenseScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddExpense'>>();
  const { projectId } = route.params;

  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    // In a real app, you'd save this to a database
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.header}>
        <Pressable style={styles.cancelBtn} onPress={() => navigation.goBack()} testID="cancel-add-expense-btn" accessibilityLabel="Cancel add expense">
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Add Expense</Text>

        <View style={{ width: 64 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.label}>Category</Text>
          <View style={styles.selectBox} testID="category-select">
            <Text style={styles.selectPlaceholder}>Select category</Text>
            <Text style={styles.expand}>⌄</Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date of Expense</Text>
          <View style={styles.selectBox} testID="date-select">
            <Text style={styles.selectPlaceholder}>2023-10-27</Text>
          </View>
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
        <Pressable style={styles.submitBtn} onPress={handleSubmit} testID="submit-expense-btn" accessibilityLabel="Submit expense">
          <Text style={styles.submitText}>Submit Expense</Text>
          <Text style={styles.submitArrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
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

  content: {
    paddingBottom: 140,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f6f7f8',
    paddingBottom: 32,
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
});
