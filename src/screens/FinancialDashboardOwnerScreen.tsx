import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/projectService';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  DimensionValue,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type Project = {
  name: string;
  amount: string;
  pct: string;
  color: string;
};

export default function FinancialDashboardOwnerScreen() {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();

  const { user } = useAuth();
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectService.getProjects(user?.id, {});
        setProjectsData(data);
      } catch (e) {
        setError(e.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [user?.id]);


  const legendData: Project[] = [
    { name: 'Materials', amount: '', pct: '45%', color: '#136dec' },
    { name: 'Labor', amount: '', pct: '30%', color: '#f59e0b' },
    { name: 'Logistics', amount: '', pct: '25%', color: '#ef4444' },
  ];

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={() => {
    setLoading(true);
    setError(null);
    // trigger re-fetch by changing user.id dependency (no need here)
  }} />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable
            style={styles.iconBtn}
            onPress={() => navigation.goBack()}
            testID="back-btn"
            accessibilityRole="button"
            accessibilityLabel="Back"
            accessibilityHint="Navigates to previous screen"
          >
            <Text>←</Text>
          </Pressable>

          <View style={styles.profileRow}>
            <Pressable
              style={styles.avatar}
              onPress={() => navigation.navigate('Profile')}
              accessibilityRole="button"
              accessibilityLabel="Profile"
              accessibilityHint="Open profile screen"
            />
            <View>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.name}>James Carter</Text>
            </View>
          </View>

          <Pressable style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            accessibilityHint="View notifications"
          >
            <Text>🔔</Text>
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* Time Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <View style={[styles.filterChip, styles.filterActive]}>
              <Text style={styles.filterActiveText}>This Year</Text>
            </View>
            <View style={styles.filterChip}>
              <Text style={styles.filterText}>Last Quarter</Text>
            </View>
            <View style={styles.filterChip}>
              <Text style={styles.filterText}>Last Month</Text>
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Scrollable Content */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator
        >
          {/* Hero KPI */}
          <View style={styles.heroCard}>
            <Text style={styles.kpiLabel}>Net Profit (YTD)</Text>
            <Text style={styles.kpiValue}>₹12,40,50,000</Text>

            <View style={styles.kpiRow}>
              <View style={styles.kpiItem}>
                <Text style={styles.kpiSub}>Revenue</Text>
                <Text style={styles.kpiSubValue}>₹45Cr</Text>
              </View>

              <View style={styles.dividerVertical} />

              <View style={styles.kpiItem}>
                <Text style={styles.kpiSub}>Expenses</Text>
                <Text style={styles.kpiSubValue}>₹32Cr</Text>
              </View>
            </View>
          </View>

          {/* Financial Performance */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Financial Performance</Text>
              <Text style={styles.trend}>+12%</Text>
            </View>

            <View style={styles.barChart}>
              {['2021', '2022', '2023'].map((year, i) => (
                <View key={year} style={styles.barGroup}>
                  <View style={styles.barStack}>
                    <View
                      style={[
                        styles.incomeBar,
                        { height: [45, 65, 85][i] },
                      ]}
                    />
                    <View
                      style={[
                        styles.expenseBar,
                        { height: [35, 50, 60][i] },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      i === 2 && styles.barLabelActive,
                    ]}
                  >
                    {year}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Expense Distribution */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Expense Distribution</Text>

            <View style={styles.donutRow}>
              <View style={styles.donut}>
                <View style={styles.donutHole}>
                  <Text style={styles.donutText}>Total</Text>
                </View>
              </View>

              <View style={styles.legend}>
                {legendData.map(item => (
                  <View key={item.name} style={styles.legendRow}>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: item.color },
                      ]}
                    />
                    <Text style={styles.legendLabel}>{item.name}</Text>
                    <Text style={styles.legendValue}>{item.pct}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Top Projects */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Top Projects by Expense
              </Text>
              <Text style={styles.link}>View All</Text>
            </View>

            {projects.map(project => (
              <View key={project.name} style={styles.projectCard}>
                <View style={styles.projectTop}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  <Text style={styles.projectAmount}>{project.amount}</Text>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: project.pct as DimensionValue,
                        backgroundColor: project.color,
                      },
                    ]}
                  />
                </View>

                <View style={styles.projectFooter}>
                  <Text
                    style={[
                      styles.pctText,
                      { color: project.color },
                    ]}
                  >
                    {project.pct} of Budget
                  </Text>
                  <Text style={styles.targetText}>Target set</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {['Home', 'Projects', 'Reports', 'Team'].map((tab, i) => (
          <Pressable
            key={tab}
            style={styles.navItem}
            testID={`tab-${tab}`}
            onPress={() => {
              if (tab === 'Projects' || tab === 'Home')
                navigation.navigate('ProjectList');
              if (tab === 'Reports')
                navigation.navigate('ProjectDashboard', { projectId: 'global' });
              if (tab === 'Team')
                navigation.navigate('UserManagement');
            }}
          >
            <Text
              style={[
                styles.navText,
                i === 2 && styles.navActive,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f7f8' },

  scrollView: {
    flex: 1,
  },

  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  profileRow: { flexDirection: 'row', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cbd5e1',
  },
  greeting: { fontSize: 12, color: '#64748b' },
  name: { fontSize: 14, fontWeight: '700' },
  iconBtn: { position: 'relative', padding: 8 },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  },

  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  filterActive: {
    backgroundColor: '#136dec',
    borderColor: '#136dec',
  },
  filterText: { fontSize: 14, color: '#64748b' },
  filterActiveText: { fontSize: 14, color: '#fff', fontWeight: '600' },

  content: { padding: 16 },

  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  kpiLabel: { fontSize: 14, color: '#64748b' },
  kpiValue: { fontSize: 28, fontWeight: '800', marginVertical: 8 },
  kpiRow: { flexDirection: 'row', marginTop: 12 },
  kpiItem: { flex: 1 },
  kpiSub: { fontSize: 12, color: '#64748b' },
  kpiSubValue: { fontSize: 16, fontWeight: '700' },
  dividerVertical: { width: 1, backgroundColor: '#e5e7eb' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  trend: { color: '#10b981', fontWeight: '700' },

  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 160,
  },
  barGroup: { flex: 1, alignItems: 'center' },
  barStack: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: '100%',
  },
  incomeBar: {
    width: 10,
    backgroundColor: '#136dec',
    borderRadius: 4,
  },
  expenseBar: {
    width: 10,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  barLabel: { fontSize: 12, color: '#64748b', marginTop: 6 },
  barLabelActive: { color: '#136dec', fontWeight: '700' },

  donutRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  donut: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutText: { fontSize: 14, fontWeight: '700' },

  legend: { flex: 1, gap: 12 },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { flex: 1, marginLeft: 8 },
  legendValue: { fontWeight: '700' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  link: { color: '#136dec', fontWeight: '600' },

  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  projectTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectName: { fontWeight: '700' },
  projectAmount: { fontWeight: '700' },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 8,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  pctText: { fontSize: 12, fontWeight: '600' },
  targetText: { fontSize: 12, color: '#64748b' },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  navItem: { alignItems: 'center' },
  navText: { fontSize: 12, color: '#94a3b8' },
  navActive: { color: '#136dec', fontWeight: '700' },
});
