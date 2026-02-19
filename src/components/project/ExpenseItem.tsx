// src/components/project/ExpenseItem.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { StyleSheet } from 'react-native';

interface ExpenseItemProps {
  expense: {
    id: string;
    projectId: string;
    amount: number;
    description: string;
    category: string;
    date: string;
    createdBy: string;
    createdAt: string;
  };
  onPress?: () => void;
}

export function ExpenseItem({ expense, onPress }: ExpenseItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'labor': return '👷';
      case 'materials': return '🏗️';
      case 'equipment': return '🔧';
      case 'transport': return '🚚';
      case 'permits': return '📋';
      case 'utilities': return '⚡';
      case 'subcontractor': return '🤝';
      default: return '💰';
    }
  };

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryIconText}>
            {getCategoryIcon(expense.category)}
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.description} numberOfLines={2}>
            {expense.description}
          </Text>
          <Text style={styles.category}>{expense.category}</Text>
          <Text style={styles.date}>{formatDate(expense.date)}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  description: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  category: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
  },
});