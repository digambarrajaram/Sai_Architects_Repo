import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserRole } from '../navigation/types';
import { useAuth } from '../context/AuthContext';

export default function ProjectListScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { role } = useAuth();

  const isOwner = role === UserRole.OWNER;

  const handleProjectPress = (projectId: string) => {
    if (isOwner) {
      navigation.navigate('ProjectDetailOwner', { projectId });
    } else {
      navigation.navigate('ProjectDetailSupervisor', { projectId });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.navigate('Profile')} testID="avatar-btn">
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdAAOZJqim0kt4F9Uh9ScpvNwgVGwMgYcSvL1ixsZCa9sNhVfajzFCKDNTpRZW6mBdXhIA1FkcqFkaN7Z6xODdwedScBBNKvoXL0dyN-x179V1xKDkLhzaOfqqm-X1_dLSBkiCZnDOBb5lBFb5hBxV7Jww8kPQMP8ShHU6ERwhT7fq4zYi-uLYLs4zHF-OzkWsaNl1bKCU4KsMfr4Ri2uWY9sf5IbcboigeL6JtpxuI5mqkW4vJVzJajQFGPfrPMrRYkyDBH1_Bhtl',
            }}
            style={styles.avatar}
          />
        </Pressable>
        <Text style={styles.headerTitle} testID="projects-title">Projects</Text>
        <Pressable style={styles.addButton} testID="add-project-btn">
          <Text style={styles.addIcon}>＋</Text>
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search by project name or ID..."
            style={styles.searchInput}
          />
          <Pressable style={styles.filterButton}>
            <Text>≡</Text>
          </Pressable>
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'In Progress', 'Pending', 'Delayed', 'Completed'].map(
            (item, index) => (
              <View
                key={item}
                style={[
                  styles.chip,
                  index === 0 && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    index === 0 && styles.chipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </View>
            )
          )}
        </ScrollView>

        {/* Headline */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle} testID="active-sites-title">Active Sites</Text>
          <Text style={styles.sectionMeta}>3 Ongoing</Text>
        </View>

        {/* Project Cards (static, converted as-is) */}
        <Pressable 
          style={styles.card}
          onPress={() => handleProjectPress('CIV-2023-089')}
          testID="project-card-CIV-2023-089"
        >
          <View style={styles.cardHeader}>
            <View style={styles.row}>
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbSApV4NbxJjju-zgh1ITIK-lEQabSN34Oe5j9HgBZjsxzJlxMQvvSkiK73ozsjEgLN5KKX0KrY8F61m42YlUfrhq6i4FniQ1osm4EA6pXG9r1xnqfrcHVr9ELOtkJtUIpPNeJ9i50iAfBZjdL007zvSHBLY-6aqwUa0MIDs_bp_3CJd9NA_SUsrcD-Htt22QtTW11srnXyUg23-z3-EfFqQFIwJSfsgN084OnMXEkTR-nKXoxznu4Yk_UXRLjWoygP5dqsS4gz-LI',
                }}
                style={styles.cardImage}
              />
              <View>
                <Text style={styles.cardTitle}>Highway 44 Expansion</Text>
                <Text style={styles.cardSub}>
                  #CIV-2023-089 • North District
                </Text>
              </View>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>In Progress</Text>
            </View>
          </View>

          {isOwner && (
            <View style={styles.financials}>
              <View>
                <Text style={styles.label}>Total Spent</Text>
                <Text style={styles.spent}>$45,200</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Budget</Text>
                <Text style={styles.budget}>$120,000</Text>
              </View>
            </View>
          )}

          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: '37%' }]} />
          </View>
        </Pressable>
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.tabBar}>
        {(isOwner 
          ? ['Projects', 'Expenses', 'Reports', 'Settings'] 
          : ['Projects', 'Expenses', 'Settings']
        ).map((t, i) => (
          <Pressable 
            key={t} 
            style={styles.tabItem}
            testID={`tab-${t}`}
            onPress={() => {
              if (t === 'Reports') navigation.navigate('ProjectDashboard', { projectId: 'global' });
              if (t === 'Projects') navigation.navigate('ProjectList');
              if (t === 'Settings') navigation.navigate('Profile');
            }}
          >
            <Text style={i === 0 ? styles.tabActive : styles.tabText}>{t}</Text>
          </Pressable>
        ))}
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
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#136dec22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIcon: { fontSize: 20, color: '#136dec' },

  content: { padding: 16, gap: 16, paddingBottom: 100 },

  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    marginRight: 8,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: '#0f172a' },
  chipText: { fontSize: 12, color: '#64748b' },
  chipTextActive: { color: '#fff', fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionMeta: { fontSize: 12, color: '#64748b' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: { flexDirection: 'row', gap: 12 },
  cardImage: { width: 48, height: 48, borderRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 12, color: '#64748b' },

  badge: {
    backgroundColor: '#e0edff',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#136dec' },

  financials: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { fontSize: 11, color: '#64748b' },
  spent: { fontSize: 20, fontWeight: '700', color: '#136dec' },
  budget: { fontSize: 13, fontWeight: '600', color: '#64748b' },

  progressBg: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#136dec',
  },

  tabBar: {
    height: 64,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 11, color: '#64748b' },
  tabActive: { fontSize: 11, fontWeight: '700', color: '#136dec' },
});
