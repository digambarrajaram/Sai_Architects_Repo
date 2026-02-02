/**
 * CivManager - Empty State Component
 * Reusable empty state display for screens
 * UI Testing Ready - fixed dimensions, testID support
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
import { colors } from '../../theme/colors';

// =====================================================
// TYPES
// =====================================================

interface EmptyStateProps {
  /** Title to display */
  title?: string;
  /** Description message */
  message?: string;
  /** Icon emoji or component */
  icon?: string | React.ReactNode;
  /** Action button text */
  actionText?: string;
  /** Action callback */
  onAction?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Test ID for UI testing */
  testID?: string;
}

// =====================================================
// COMPONENT
// =====================================================

export function EmptyState({
  title = 'No Data',
  message = 'There is nothing to display here yet.',
  icon = '📭',
  actionText,
  onAction,
  style,
  testID = 'empty-state',
}: EmptyStateProps): React.ReactElement {
  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.iconContainer} testID={`${testID}-icon`}>
        {typeof icon === 'string' ? (
          <Text style={styles.icon}>{icon}</Text>
        ) : (
          icon
        )}
      </View>
      
      <Text style={styles.title} testID={`${testID}-title`}>
        {title}
      </Text>
      
      <Text style={styles.message} testID={`${testID}-message`}>
        {message}
      </Text>
      
      {actionText && onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          testID={`${testID}-action-button`}
          accessibilityRole="button"
          accessibilityLabel={actionText}
        >
          <Text style={styles.actionButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// =====================================================
// PRESET EMPTY STATES
// =====================================================

interface EmptyProjectsProps {
  onCreateProject?: () => void;
  testID?: string;
}

export function EmptyProjects({
  onCreateProject,
  testID = 'empty-projects',
}: EmptyProjectsProps): React.ReactElement {
  return (
    <EmptyState
      icon="🏗️"
      title="No Projects Yet"
      message="Start by creating your first project to track expenses and manage your civil engineering work."
      actionText={onCreateProject ? 'Create Project' : undefined}
      onAction={onCreateProject}
      testID={testID}
    />
  );
}

interface EmptyExpensesProps {
  onAddExpense?: () => void;
  testID?: string;
}

export function EmptyExpenses({
  onAddExpense,
  testID = 'empty-expenses',
}: EmptyExpensesProps): React.ReactElement {
  return (
    <EmptyState
      icon="💰"
      title="No Expenses"
      message="This project doesn't have any expenses recorded yet. Add your first expense to start tracking."
      actionText={onAddExpense ? 'Add Expense' : undefined}
      onAction={onAddExpense}
      testID={testID}
    />
  );
}

interface EmptyAuditLogsProps {
  testID?: string;
}

export function EmptyAuditLogs({
  testID = 'empty-audit-logs',
}: EmptyAuditLogsProps): React.ReactElement {
  return (
    <EmptyState
      icon="📋"
      title="No Activity"
      message="There are no audit logs for this project yet. Activity will appear here as changes are made."
      testID={testID}
    />
  );
}

interface EmptyReportsProps {
  testID?: string;
}

export function EmptyReports({
  testID = 'empty-reports',
}: EmptyReportsProps): React.ReactElement {
  return (
    <EmptyState
      icon="📊"
      title="No Reports"
      message="Generate a report by selecting a date range and clicking the generate button."
      testID={testID}
    />
  );
}

interface EmptySearchResultsProps {
  searchQuery?: string;
  onClearSearch?: () => void;
  testID?: string;
}

export function EmptySearchResults({
  searchQuery,
  onClearSearch,
  testID = 'empty-search-results',
}: EmptySearchResultsProps): React.ReactElement {
  return (
    <EmptyState
      icon="🔍"
      title="No Results Found"
      message={
        searchQuery
          ? `No results found for "${searchQuery}". Try a different search term.`
          : 'No results match your search criteria.'
      }
      actionText={onClearSearch ? 'Clear Search' : undefined}
      onAction={onClearSearch}
      testID={testID}
    />
  );
}

interface EmptyUsersProps {
  onAddUser?: () => void;
  testID?: string;
}

export function EmptyUsers({
  onAddUser,
  testID = 'empty-users',
}: EmptyUsersProps): React.ReactElement {
  return (
    <EmptyState
      icon="👥"
      title="No Users"
      message="No users have been added to the system yet."
      actionText={onAddUser ? 'Add User' : undefined}
      onAction={onAddUser}
      testID={testID}
    />
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 250, // Fixed minimum height for testing
  } as ViewStyle,
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.backgroundSecondary || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  } as ViewStyle,
  icon: {
    fontSize: 48,
  } as TextStyle,
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text || '#333',
    marginBottom: 8,
    textAlign: 'center',
  } as TextStyle,
  message: {
    fontSize: 16,
    color: colors.textSecondary || '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    maxWidth: 300,
  } as TextStyle,
  actionButton: {
    backgroundColor: colors.primary || '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  } as ViewStyle,
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
});

export default EmptyState;
