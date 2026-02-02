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

export default function ProjectDetailSupervisorScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ProjectDetailSupervisor'>>();
  const { projectId } = route.params;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          testID="back-btn"
        >
          <Text>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Project Detail</Text>

        <Pressable style={styles.iconBtn}>
          <Text>⋮</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Project Header */}
        <View style={styles.card}>
          <View style={styles.imageBlock}>
            <View style={styles.imageOverlay} />
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>

          <Text style={styles.projectTitle}>
            Hwy 401 Expansion - Zone B
          </Text>

          <Text style={styles.location}>
            📍 Toronto, ON
          </Text>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.metaLabel}>START DATE</Text>
              <Text style={styles.metaValue}>Aug 15, 2023</Text>
            </View>
            <View>
              <Text style={styles.metaLabel}>ZONE LEAD</Text>
              <Text style={styles.metaValue}>M. Thompson</Text>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterWrap}>
          {['Daily', 'Weekly', 'Monthly'].map((f, i) => (
            <View
              key={f}
              style={[
                styles.filterItem,
                i === 0 && styles.filterActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  i === 0 && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </View>
          ))}
        </View>

        {/* Expenses */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Expenses</Text>
          <Text style={styles.primary}>View All</Text>
        </View>

        {[
          ['Concrete Supply', 'Lafarge • Oct 12', '$1,200.00', 'Approved'],
          ['Fuel Refill - Truck #4', 'Shell • Oct 12', '$85.50', 'Pending'],
          ['Safety Gear Restock', 'Uline • Oct 11', '$340.00', 'Approved'],
          ['Team Lunch', 'Pizza Hut • Oct 10', '$125.00', 'Approved'],
        ].map((e, i) => (
          <View key={i} style={styles.expenseItem}>
            <View style={styles.expenseIcon} />
            <View style={{ flex: 1 }}>
              <View style={styles.expenseTop}>
                <Text
                  numberOfLines={1}
                  style={styles.expenseTitle}
                >
                  {e[0]}
                </Text>
                <Text style={styles.expenseAmount}>
                  {e[2]}
                </Text>
              </View>
              <View style={styles.expenseBottom}>
                <Text style={styles.expenseMeta}>{e[1]}</Text>
                <View
                  style={[
                    styles.statusPill,
                    e[3] === 'Approved'
                      ? styles.statusApproved
                      : styles.statusPending,
                  ]}
                >
                  <Text style={styles.statusPillText}>
                    {e[3]}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Add Button */}
      <Pressable 
        style={styles.fab}
        onPress={() => navigation.navigate('AddExpense', { projectId })}
        testID="add-expense-fab"
      >
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>
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
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f6f7f8',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingBottom: 120,
  },

  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  imageBlock: {
    height: 160,
    borderRadius: 12,
    backgroundColor: '#cbd5e1',
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    margin: 12,
    backgroundColor: '#22c55e',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  projectTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  metaLabel: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '700',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },

  filterWrap: {
    flexDirection: 'row',
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  filterItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterActive: {
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#136dec',
    fontWeight: '700',
  },

  sectionHeader: {
    marginTop: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  primary: {
    color: '#136dec',
    fontWeight: '600',
  },

  expenseItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  expenseIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },

  expenseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },

  expenseBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  expenseMeta: {
    fontSize: 14,
    color: '#64748b',
  },

  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusApproved: {
    backgroundColor: '#dcfce7',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#136dec',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});
