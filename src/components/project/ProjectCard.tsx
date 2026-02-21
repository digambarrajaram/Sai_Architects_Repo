/**
 * CivManager - Project Card Component
 * Reusable project card for list displays
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
import { Project, ProjectTotals } from '../../types';
import { colors } from '../../theme/colors';
import { shadowPresets } from '../../theme/shadows';

// =====================================================
// TYPES
// =====================================================

type ProjectStatusType = 'active' | 'planning' | 'completed' | 'on_hold';

interface ProjectCardProps {
  project: Project;
  totals?: ProjectTotals;
  onPress: (projectId: string) => void;
  showBudget?: boolean;
  showProgress?: boolean;
  style?: ViewStyle;
  testID?: string;
}

// =====================================================
// STATUS BADGE
// =====================================================

const STATUS_COLORS: Record<ProjectStatusType, { bg: string; text: string }> = {
  planning: { bg: '#E3F2FD', text: '#1976D2' },
  active: { bg: '#E8F5E9', text: '#388E3C' },
  on_hold: { bg: '#FFF3E0', text: '#F57C00' },
  completed: { bg: '#E0F2F1', text: '#00796B' },
};

const STATUS_LABELS: Record<ProjectStatusType, string> = {
  planning: 'Planning',
  active: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
};

interface StatusBadgeProps {
  status: ProjectStatusType;
  testID?: string;
}

export function StatusBadge({ status, testID }: StatusBadgeProps): React.ReactElement {
  const statusColor = STATUS_COLORS[status];
  
  return (
    <View
      style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}
      testID={testID}
    >
      <Text style={[styles.statusText, { color: statusColor.text }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

// =====================================================
// PROGRESS BAR
// =====================================================

interface ProgressBarProps {
  progress: number; // 0-100
  testID?: string;
}

export function ProgressBar({ progress, testID }: ProgressBarProps): React.ReactElement {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  // Determine color based on progress percentage
  let progressColor: string;
  if (clampedProgress > 100) {
    // Over budget - red
    progressColor = '#DC2626'; // red-600
  } else if (clampedProgress >= 90) {
    // 90-100% - orange-red
    progressColor = '#EA580C'; // orange-600
  } else if (clampedProgress >= 75) {
    // 75-90% - amber/orange
    progressColor = '#F59E0B'; // amber-500
  } else {
    // 0-75% - green
    progressColor = '#10B981'; // emerald-500
  }
  
  return (
    <View style={styles.progressContainer} testID={testID}>
      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${clampedProgress}%`, backgroundColor: progressColor },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{clampedProgress.toFixed(0)}%</Text>
    </View>
  );
}

// =====================================================
// PROJECT CARD COMPONENT
// =====================================================

export function ProjectCard({
  project,
  totals,
  onPress,
  showBudget = false,
  showProgress = false,
  style,
  testID = 'project-card',
}: ProjectCardProps): React.ReactElement {
  const budgetProgress = totals && totals.totalBudget > 0
    ? (totals.totalExpenses / totals.totalBudget) * 100
    : 0;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        totals && totals.remainingBudget < 0 && styles.cardOverBudget,
        style,
      ]}
      onPress={() => onPress(project.id)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Project: ${project.name}`}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1} testID={`${testID}-name`}>
          {project.name}
        </Text>
        <StatusBadge status={project.status} testID={`${testID}-status`} />
      </View>
      
      {showBudget && totals && (
        <View style={styles.budgetRow} testID={`${testID}-budget`}>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Budget</Text>
            <Text style={styles.budgetValue}>₹{formatCurrency(totals.totalBudget)}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Spent</Text>
            <Text style={styles.budgetValue}>₹{formatCurrency(totals.totalExpenses)}</Text>
          </View>
          <View style={styles.budgetItem}>
            <Text style={styles.budgetLabel}>Remaining</Text>
            <View style={styles.remainingValueContainer}>
              {totals.remainingBudget < 0 && (
                <View style={styles.warningContainer}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                </View>
              )}
              <Text style={[
                styles.budgetValue,
                totals.remainingBudget < 0 && styles.budgetNegative,
              ]}>
                {totals.remainingBudget < 0 ? '-' : ''}₹{formatCurrency(Math.abs(totals.remainingBudget))}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {showProgress && totals && (
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Budget Used</Text>
          <ProgressBar progress={budgetProgress} testID={`${testID}-progress`} />
        </View>
      )}
      
      <View style={styles.footer}>
        <Text style={styles.date}>
          Created: {formatDate(project.created_at)}
        </Text>
        {project.due_date && (
          <Text style={styles.date}>
            Due: {formatDate(project.due_date)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// =====================================================
// COMPACT PROJECT CARD
// =====================================================

interface CompactProjectCardProps {
  project: Project;
  onPress: (projectId: string) => void;
  testID?: string;
}

export function CompactProjectCard({
  project,
  onPress,
  testID = 'compact-project-card',
}: CompactProjectCardProps): React.ReactElement {
  return (
    <TouchableOpacity
      style={styles.compactCard}
      onPress={() => onPress(project.id)}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Project: ${project.name}`}
    >
      <View style={styles.compactContent}>
        <Text style={styles.compactName} numberOfLines={1}>
          {project.name}
        </Text>
        <Text style={styles.compactLocation} numberOfLines={1}>
          Due: {formatDate(project.due_date)}
        </Text>
      </View>
      <StatusBadge status={project.status} />
    </TouchableOpacity>
  );
}

// =====================================================
// HELPERS
// =====================================================

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return amount.toFixed(0);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 120,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text || '#333',
    flex: 1,
    marginRight: 12,
  } as TextStyle,
  description: {
    fontSize: 14,
    color: colors.textSecondary || '#666',
    lineHeight: 20,
    marginBottom: 8,
  } as TextStyle,
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  } as TextStyle,
  location: {
    fontSize: 13,
    color: colors.textSecondary || '#666',
    flex: 1,
  } as TextStyle,
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  } as ViewStyle,
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  } as TextStyle,
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  } as ViewStyle,
  budgetItem: {
    alignItems: 'center',
  } as ViewStyle,
  budgetLabel: {
    fontSize: 11,
    color: colors.textSecondary || '#666',
    marginBottom: 2,
  } as TextStyle,
  budgetValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text || '#333',
  } as TextStyle,
  budgetNegative: {
    color: '#DC2626',
    fontWeight: '700',
  } as TextStyle,
  remainingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  } as ViewStyle,
  warningContainer: {
    marginRight: 4,
  } as ViewStyle,
  warningIcon: {
    fontSize: 14,
  } as TextStyle,
  cardOverBudget: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 2,
  } as ViewStyle,
  progressRow: {
    marginTop: 12,
  } as ViewStyle,
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary || '#666',
    marginBottom: 4,
  } as TextStyle,
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  } as ViewStyle,
  progressFill: {
    height: '100%',
    borderRadius: 4,
  } as ViewStyle,
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary || '#666',
    marginLeft: 8,
    minWidth: 40,
    textAlign: 'right',
  } as TextStyle,
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  } as ViewStyle,
  date: {
    fontSize: 12,
    color: colors.textSecondary || '#666',
  } as TextStyle,
  client: {
    fontSize: 12,
    color: colors.primary || '#007AFF',
    fontWeight: '500',
    maxWidth: '50%',
  } as TextStyle,
  compactCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadowPresets.listItem,
    minHeight: 60, // Fixed minimum height for testing
  } as ViewStyle,
  compactContent: {
    flex: 1,
    marginRight: 12,
  } as ViewStyle,
  compactName: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text || '#333',
  } as TextStyle,
  compactLocation: {
    fontSize: 12,
    color: colors.textSecondary || '#666',
    marginTop: 2,
  } as TextStyle,
});

export default ProjectCard;
