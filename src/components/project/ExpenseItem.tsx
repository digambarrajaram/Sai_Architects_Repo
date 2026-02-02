/**
 * CivManager - Expense Item Component
 * Reusable expense item for list displays
 * No navigation logic - uses callbacks
 * No business logic - pure presentation
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Expense, ExpenseCategory } from '../../types';
import { colors } from '../../theme/colors';

// =====================================================
// TYPES
// =====================================================

interface ExpenseItemProps {
  expense: Expense;
  onPress?: (expenseId: string) => void;
  onEdit?: (expenseId: string) => void;
  onDelete?: (expenseId: string) => void;
  showActions?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// =====================================================
// CATEGORY CONFIG
// =====================================================

const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: string; color: string; label: string }> = {
  [ExpenseCategory.LABOR]: { icon: '👷', color: '#1976D2', label: 'Labor' },
  [ExpenseCategory.MATERIALS]: { icon: '🧱', color: '#388E3C', label: 'Materials' },
  [ExpenseCategory.EQUIPMENT]: { icon: '🚜', color: '#F57C00', label: 'Equipment' },
  [ExpenseCategory.TRANSPORT]: { icon: '🚛', color: '#7B1FA2', label: 'Transport' },
  [ExpenseCategory.PERMITS]: { icon: '📄', color: '#00796B', label: 'Permits' },
  [ExpenseCategory.UTILITIES]: { icon: '⚡', color: '#FBC02D', label: 'Utilities' },
  [ExpenseCategory.SUBCONTRACTOR]: { icon: '🏗️', color: '#5D4037', label: 'Subcontractor' },
  [ExpenseCategory.MISCELLANEOUS]: { icon: '📦', color: '#607D8B', label: 'Miscellaneous' },
};

// =====================================================
// CATEGORY BADGE
// =====================================================

interface CategoryBadgeProps {
  category: ExpenseCategory;
  testID?: string;
}

export function CategoryBadge({ category, testID }: CategoryBadgeProps): React.ReactElement {
  const config = CATEGORY_CONFIG[category];
  
  return (
    <View
      style={[styles.categoryBadge, { backgroundColor: `${config.color}15` }]}
      testID={testID}
    >
      <Text style={styles.categoryIcon}>{config.icon}</Text>
      <Text style={[styles.categoryText, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
}

// =====================================================
// EXPENSE ITEM COMPONENT
// =====================================================

export function ExpenseItem({
  expense,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
  style,
  testID = 'expense-item',
}: ExpenseItemProps): React.ReactElement {
  const config = CATEGORY_CONFIG[expense.category];
  
  const content = (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.iconContainer}>
        <View style={[styles.iconCircle, { backgroundColor: `${config.color}20` }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={2} testID={`${testID}-description`}>
          {expense.description}
        </Text>
        
        <View style={styles.metaRow}>
          <CategoryBadge category={expense.category} testID={`${testID}-category`} />
          <Text style={styles.date}>{formatDate(expense.date)}</Text>
        </View>
        
        {expense.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {expense.notes}
          </Text>
        )}
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={styles.amount} testID={`${testID}-amount`}>
          ₹{formatAmount(expense.amount)}
        </Text>
        
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(expense.id)}
                testID={`${testID}-edit`}
                accessibilityRole="button"
                accessibilityLabel="Edit expense"
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(expense.id)}
                testID={`${testID}-delete`}
                accessibilityRole="button"
                accessibilityLabel="Delete expense"
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => onPress(expense.id)}
        testID={`${testID}-touchable`}
        accessibilityRole="button"
        accessibilityLabel={`Expense: ${expense.description}`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// =====================================================
// COMPACT EXPENSE ITEM
// =====================================================

interface CompactExpenseItemProps {
  expense: Expense;
  onPress?: (expenseId: string) => void;
  testID?: string;
}

export function CompactExpenseItem({
  expense,
  onPress,
  testID = 'compact-expense-item',
}: CompactExpenseItemProps): React.ReactElement {
  const config = CATEGORY_CONFIG[expense.category];
  
  const content = (
    <View style={styles.compactContainer} testID={testID}>
      <Text style={styles.compactIcon}>{config.icon}</Text>
      <View style={styles.compactContent}>
        <Text style={styles.compactDescription} numberOfLines={1}>
          {expense.description}
        </Text>
        <Text style={styles.compactDate}>{formatDate(expense.date)}</Text>
      </View>
      <Text style={styles.compactAmount}>₹{formatAmount(expense.amount)}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={() => onPress(expense.id)}
        testID={`${testID}-touchable`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

// =====================================================
// EXPENSE SUMMARY ROW
// =====================================================

interface ExpenseSummaryRowProps {
  category: ExpenseCategory;
  total: number;
  count: number;
  percentage: number;
  testID?: string;
}

export function ExpenseSummaryRow({
  category,
  total,
  count,
  percentage,
  testID = 'expense-summary-row',
}: ExpenseSummaryRowProps): React.ReactElement {
  const config = CATEGORY_CONFIG[category];
  
  return (
    <View style={styles.summaryRow} testID={testID}>
      <View style={styles.summaryLeft}>
        <Text style={styles.summaryIcon}>{config.icon}</Text>
        <View>
          <Text style={styles.summaryCategory}>{config.label}</Text>
          <Text style={styles.summaryCount}>{count} expense{count !== 1 ? 's' : ''}</Text>
        </View>
      </View>
      <View style={styles.summaryRight}>
        <Text style={styles.summaryAmount}>₹{formatAmount(total)}</Text>
        <Text style={styles.summaryPercentage}>{percentage.toFixed(1)}%</Text>
      </View>
    </View>
  );
}

// =====================================================
// HELPERS
// =====================================================

function formatAmount(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toLocaleString('en-IN');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  });
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 80, // Fixed minimum height for testing
  } as ViewStyle,
  iconContainer: {
    marginRight: 12,
  } as ViewStyle,
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  icon: {
    fontSize: 20,
  } as TextStyle,
  content: {
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text || '#333',
    marginBottom: 4,
  } as TextStyle,
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  date: {
    fontSize: 12,
    color: colors.textSecondary || '#666',
    marginLeft: 8,
  } as TextStyle,
  notes: {
    fontSize: 12,
    color: colors.textSecondary || '#666',
    fontStyle: 'italic',
    marginTop: 4,
  } as TextStyle,
  amountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: 12,
  } as ViewStyle,
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text || '#333',
  } as TextStyle,
  actions: {
    flexDirection: 'row',
    marginTop: 8,
  } as ViewStyle,
  actionButton: {
    padding: 4,
    marginLeft: 8,
  } as ViewStyle,
  actionIcon: {
    fontSize: 16,
  } as TextStyle,
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  } as ViewStyle,
  categoryIcon: {
    fontSize: 10,
    marginRight: 4,
  } as TextStyle,
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
  } as TextStyle,
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    minHeight: 50, // Fixed minimum height for testing
  } as ViewStyle,
  compactIcon: {
    fontSize: 16,
    marginRight: 10,
  } as TextStyle,
  compactContent: {
    flex: 1,
  } as ViewStyle,
  compactDescription: {
    fontSize: 14,
    color: colors.text || '#333',
  } as TextStyle,
  compactDate: {
    fontSize: 11,
    color: colors.textSecondary || '#666',
  } as TextStyle,
  compactAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text || '#333',
  } as TextStyle,
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  } as ViewStyle,
  summaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  summaryIcon: {
    fontSize: 24,
    marginRight: 12,
  } as TextStyle,
  summaryCategory: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text || '#333',
  } as TextStyle,
  summaryCount: {
    fontSize: 12,
    color: colors.textSecondary || '#666',
  } as TextStyle,
  summaryRight: {
    alignItems: 'flex-end',
  } as ViewStyle,
  summaryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text || '#333',
  } as TextStyle,
  summaryPercentage: {
    fontSize: 12,
    color: colors.textSecondary || '#666',
  } as TextStyle,
});

export default ExpenseItem;
