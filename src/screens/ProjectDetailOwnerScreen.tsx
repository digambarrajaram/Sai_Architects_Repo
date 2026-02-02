import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

export default function ProjectDetailOwnerScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectDetailOwner'>>();
  const { projectId } = route.params;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()} testID="back-btn">
          <Text>←</Text>
        </Pressable>

        <Text style={styles.headerTitle} testID="project-detail-title">Project Detail</Text>

        <View style={styles.headerActions}>
          <Pressable 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('ProjectDashboard', { projectId })}
            testID="dashboard-nav-btn"
          >
            <Text>📈</Text>
          </Pressable>
          <Pressable 
            style={styles.iconBtn}
            onPress={() => navigation.navigate('ProjectAuditLogs', { projectId })}
            testID="audit-logs-nav-btn"
          >
            <Text>📋</Text>
          </Pressable>
          <Pressable 
            style={styles.iconBtn}
            onPress={() => navigation.navigate('ProjectReports', { projectId })}
            testID="reports-nav-btn"
          >
            <Text>📑</Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Project Header */}
        <View style={styles.card}>
          <View style={styles.projectRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.statusBadge} testID="project-status-badge">
                <Text style={styles.statusText} testID="project-status-text">In Progress</Text>
              </View>
              <Text style={styles.projectTitle} testID="project-title">
                Highway 9 Resurfacing
              </Text>
              <Text style={styles.location} testID="project-location">
                📍 Sector 4, North District ({projectId})
              </Text>
            </View>

            <View style={styles.thumb} testID="project-thumbnail" />
          </View>
        </View>

        {/* Financial KPIs */}
        <View style={styles.grid2}>
          <View style={styles.card} testID="kpi-total-budget">
            <Text style={styles.kpiLabel}>TOTAL BUDGET</Text>
            <Text style={styles.kpiValue} testID="kpi-budget-value">$500,000</Text>
          </View>

          <View style={styles.card} testID="kpi-spent">
            <Text style={styles.kpiLabel}>SPENT</Text>
            <Text style={styles.kpiValue} testID="kpi-spent-value">$320,000</Text>
          </View>

          <View style={[styles.card, { flexDirection: 'row' }]} testID="kpi-net-pl">
            <View>
              <Text style={styles.kpiLabel}>NET P/L</Text>
              <Text style={styles.kpiLarge} testID="kpi-netpl-value">+$180,000</Text>
            </View>
            <View style={styles.trend} testID="kpi-trend-indicator">
              <Text>↑ 12%</Text>
            </View>
          </View>
        </View>

        {/* Budget Utilization */}
        <View style={styles.card} testID="budget-utilization-card">
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle} testID="budget-utilization-title">
              Budget Utilization
            </Text>
            <Text style={styles.primary} testID="budget-utilization-percent">64%</Text>
          </View>

          <View style={styles.progressBg} testID="budget-progress-bar">
            <View style={[styles.progressFill, { width: '64%' }]} testID="budget-progress-fill" />
          </View>

          <View style={styles.scale}>
            <Text>$0</Text>
            <Text>$250k</Text>
            <Text>$500k</Text>
          </View>
        </View>

        {/* Expense Trend */}
        <View style={styles.card} testID="expense-trend-card">
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle} testID="expense-trend-title">Expense Trend</Text>
            <View style={styles.toggle}>
              <Text style={styles.toggleActive} testID="toggle-daily">Daily</Text>
              <Text style={styles.toggleInactive} testID="toggle-weekly">Weekly</Text>
            </View>
          </View>

          <View style={styles.chart} testID="expense-chart">
            {[30, 45, 25, 85, 50, 20, 10].map((h, i) => (
              <View key={i} style={styles.barWrap} testID={`chart-bar-${i}`}>
                <View
                  style={[
                    styles.bar,
                    { height: `${h}%` },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Expenses */}
        <View testID="recent-expenses-section">
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle} testID="recent-expenses-title">
              Recent Expenses
            </Text>
            <Text style={styles.primary} testID="view-all-expenses">View All</Text>
          </View>

          {[
            ['Cement Procurement', 'Oct 24 • Material', '-$4,500'],
            ['Labor Wages - Week 4', 'Oct 22 • Labor', '-$1,200'],
            ['Excavator Rental', 'Oct 20 • Equipment', '-$800'],
            ['Water Supply', 'Oct 19 • Utilities', '-$250'],
          ].map((e, i) => (
            <View key={i} style={styles.expenseItem} testID={`expense-item-${i}`}>
              <View>
                <Text style={styles.expenseTitle} testID={`expense-title-${i}`}>{e[0]}</Text>
                <Text style={styles.expenseMeta} testID={`expense-meta-${i}`}>{e[1]}</Text>
              </View>
              <Text style={styles.expenseAmount} testID={`expense-amount-${i}`}>{e[2]}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Add Expense Button */}
      <View style={styles.fabWrap}>
        <Pressable 
          style={styles.fab}
          onPress={() => navigation.navigate('AddExpense', { projectId })}
          testID="add-expense-fab"
        >
          <Text style={styles.fabText}>＋ Add Expense</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f8' },

  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { padding: 16, gap: 16, paddingBottom: 120 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  projectRow: { flexDirection: 'row', gap: 12 },
  statusBadge: {
    backgroundColor: '#dbeafe',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginBottom: 4,
  },
  statusText: { fontSize: 12, fontWeight: '600', color: '#136dec' },
  projectTitle: { fontSize: 20, fontWeight: '700' },
  location: { fontSize: 14, color: '#64748b' },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#cbd5e1',
  },

  grid2: { gap: 12 },

  kpiLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  kpiValue: { fontSize: 20, fontWeight: '700' },
  kpiLarge: { fontSize: 24, fontWeight: '800' },
  trend: {
    marginLeft: 'auto',
    alignSelf: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  primary: { color: '#136dec', fontWeight: '600' },

  progressBg: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#136dec',
  },
  scale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 12,
  },

  toggle: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontWeight: '700',
  },
  toggleInactive: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#64748b',
  },

  chart: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    marginTop: 12,
  },
  barWrap: { flex: 1, alignItems: 'center' },
  bar: {
    width: '100%',
    backgroundColor: '#136dec',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  barLabel: { fontSize: 10, marginTop: 4, color: '#64748b' },

  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  expenseTitle: { fontSize: 14, fontWeight: '700' },
  expenseMeta: { fontSize: 12, color: '#64748b' },
  expenseAmount: { fontSize: 14, fontWeight: '700' },

  fabWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(246,247,248,0.95)',
  },
  fab: {
    backgroundColor: '#136dec',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
