import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

const OwnerAuditLogsAdminScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList>>();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { logs } = await auditLogService.getAuditLogsByProject('proj-001');
        setLogs(logs);
      } catch (e) {
        setError(e.message || 'Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

if (loading) return <LoadingState />;
if (error) return <ErrorState message={error} onRetry={() => {
  setLoading(true);
  setError(null);
  setLogs([]);
}} />;

  {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          testID="back-btn"
          accessibilityRole="button"
          accessibilityLabel="Back"
          accessibilityHint="Navigates to previous screen"
        >
          <Text style={styles.icon}>←</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Audit Logs</Text>
          <Text style={styles.headerSubtitle}>ADMIN CONSOLE</Text>
        </View>

        <Pressable style={styles.iconBtn}>
          <Text style={styles.icon}>⤓</Text>
        </Pressable>
      </View>

      {/* Search + Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search by ID, user, or project..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
            accessibilityLabel="Search audits"
            accessibilityHint="Enter ID, user or project to search"
            autoCapitalize="none"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          {['Date Range', 'User', 'Action Type', 'Severity'].map(label => (
            <View key={label} style={styles.filterChip}>
              <Text style={styles.filterChipText}>{label}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.activeFilters}>
          <Text style={styles.activeLabel}>ACTIVE:</Text>
          <View style={styles.activeChip}>
            <Text style={styles.activeChipText}>This Week</Text>
            <Text style={styles.closeIcon}>×</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Actions</Text>
              <Text style={styles.statValue}>142</Text>
              <Text style={styles.statPositive}>+12% vs last week</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Critical Alerts</Text>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statNegative}>Review needed</Text>
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            <View style={styles.timelineLine} />
            {logs.map(log => (
              <TimelineItem
                key={log.id}
                time={new Date(log.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true })}
                id={log.id}
                title={`${log.action} ${log.entity_type}`}
                badge={log.action}
                badgeStyle={styles.badgeBlue}
                description={log.details}
                project={log.projectId}
              />
            ))}
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

/* ---------------- Timeline Item ---------------- */

function TimelineItem({
  time,
  id,
  title,
  badge,
  badgeStyle,
  description,
  project,
  monoChanges,
  initials,
  strike,
  critical,
  system,
}: any) {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          {initials ? (
            <Text style={styles.initials}>{initials}</Text>
          ) : system ? (
            <Text>⚙</Text>
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      </View>

      <View
        style={[
          styles.eventCard,
          critical && styles.criticalBorder,
        ]}
      >
        <View style={styles.eventHeader}>
          <View>
            <Text style={styles.eventMeta}>
              {time} • ID: {id}
            </Text>
            <Text style={styles.eventTitle}>{title}</Text>
          </View>
          <Text style={[styles.badge, badgeStyle]}>{badge}</Text>
        </View>

        {description && (
          <Text style={styles.eventText}>{description}</Text>
        )}

        {monoChanges && (
          <View style={styles.monoBox}>
            {monoChanges.map((c: string) => (
              <Text key={c} style={styles.monoText}>{c}</Text>
            ))}
          </View>
        )}

        {strike && (
          <Text style={styles.strikeText}>{strike}</Text>
        )}

        {project && (
          <Text style={styles.projectText}>{project}</Text>
        )}
      </View>
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },

  scrollView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconBtn: { width: 40, alignItems: 'center' },
  icon: { fontSize: 20, color: '#475569' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  headerSubtitle: { fontSize: 10, color: '#64748b', fontWeight: '600' },

  filterContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 13 },

  filterRow: { marginTop: 8 },
  filterChip: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5f5',
    justifyContent: 'center',
    marginRight: 8,
  },
  filterChipText: { fontSize: 12, fontWeight: '600' },

  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  activeLabel: { fontSize: 10, color: '#64748b' },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  activeChipText: { fontSize: 11 },
  closeIcon: { fontSize: 12, marginLeft: 4 },

  content: { padding: 16 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: { fontSize: 12, color: '#64748b' },
  statValue: { fontSize: 22, fontWeight: '700' },
  statPositive: { fontSize: 10, color: '#16a34a' },
  statNegative: { fontSize: 10, color: '#dc2626' },

  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginHorizontal: 8,
  },

  timeline: { position: 'relative' },
  timelineLine: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#e2e8f0',
  },

  timelineItem: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  avatarWrapper: { width: 40, alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#cbd5e1',
  },
  initials: { fontWeight: '700', color: '#3b82f6' },

  eventCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  criticalBorder: { borderLeftWidth: 4, borderLeftColor: '#ef4444' },

  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventMeta: { fontSize: 11, color: '#64748b' },
  eventTitle: { fontSize: 14, fontWeight: '600' },

  badge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeGreen: { backgroundColor: '#dcfce7', color: '#166534' },
  badgeAmber: { backgroundColor: '#fef3c7', color: '#92400e' },
  badgeBlue: { backgroundColor: '#dbeafe', color: '#1e40af' },
  badgeRed: { backgroundColor: '#fee2e2', color: '#991b1b' },
  badgePurple: { backgroundColor: '#ede9fe', color: '#5b21b6' },

  eventText: { fontSize: 12, marginTop: 6 },
  projectText: {
    fontSize: 12,
    marginTop: 6,
    color: '#3b82f6',
    fontWeight: '600',
  },
  monoBox: {
    marginTop: 6,
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 4,
  },
  monoText: { fontSize: 11, fontFamily: 'monospace' },
  strikeText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginTop: 6,
    color: '#64748b',
  },
});
