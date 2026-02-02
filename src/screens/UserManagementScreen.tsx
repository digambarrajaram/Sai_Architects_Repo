import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UserManagementScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          testID="back-btn"
        >
          <Text style={styles.icon}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>Manage Team</Text>

        <Pressable style={styles.addBtn}>
          <Text style={styles.addIcon}>＋</Text>
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search by name or phone
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Active Users */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>
            Active Users (4)
          </Text>
          <Text style={styles.filterText}>Filter</Text>
        </View>

        {/* Current User */}
        <View style={styles.userCard}>
          <View style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe (You)</Text>
            <Text style={styles.userPhone}>+1 555-0123</Text>
          </View>
          <View style={styles.roleBadgePrimary}>
            <Text style={styles.roleTextPrimary}>Owner</Text>
          </View>
        </View>

        {/* User 1 */}
        <View style={styles.userCard}>
          <View style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Jane Smith</Text>
            <Text style={styles.userPhone}>+1 555-0987</Text>
          </View>
          <View style={styles.roleDropdown}>
            <Text style={styles.roleText}>Supervisor</Text>
            <Text style={styles.dropdownIcon}>⌄</Text>
          </View>
        </View>

        {/* User 2 */}
        <View style={styles.userCard}>
          <View style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Robert Johnson</Text>
            <Text style={styles.userPhone}>+1 555-4567</Text>
          </View>
          <View style={styles.roleDropdown}>
            <Text style={styles.roleText}>Supervisor</Text>
            <Text style={styles.dropdownIcon}>⌄</Text>
          </View>
        </View>

        {/* User 3 */}
        <View style={styles.userCard}>
          <View style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Sarah Connor</Text>
            <Text style={styles.userPhone}>+1 555-9988</Text>
          </View>
          <View style={styles.roleDropdownPrimary}>
            <Text style={styles.roleTextPrimary}>Owner</Text>
            <Text style={styles.dropdownIconPrimary}>⌄</Text>
          </View>
        </View>

        {/* Pending Invites */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={styles.sectionLabel}>
            Pending Invites (1)
          </Text>
        </View>

        <View style={[styles.userCard, styles.pendingCard]}>
          <View style={styles.pendingAvatar}>
            <Text style={styles.pendingIcon}>👤</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>Michael Chen</Text>
            <Text style={styles.userPhone}>
              Invited via email
            </Text>
          </View>
          <Pressable>
            <Text style={styles.removeIcon}>✕</Text>
          </Pressable>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f6f7f8',
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addIcon: {
    fontSize: 18,
    color: '#136dec',
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#136dec',
  },

  searchWrapper: {
    padding: 16,
  },
  searchBox: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
    color: '#94a3b8',
  },
  searchPlaceholder: {
    color: '#94a3b8',
    fontSize: 14,
  },

  content: {
    paddingHorizontal: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  filterText: {
    fontSize: 12,
    color: '#136dec',
    fontWeight: '600',
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#cbd5e1',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  userPhone: {
    fontSize: 13,
    color: '#64748b',
  },

  roleBadgePrimary: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#e0ebff',
  },
  roleTextPrimary: {
    fontSize: 12,
    fontWeight: '700',
    color: '#136dec',
  },

  roleDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roleDropdownPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#e0ebff',
    borderWidth: 1,
    borderColor: '#136dec',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#64748b',
  },
  dropdownIconPrimary: {
    fontSize: 14,
    color: '#136dec',
  },

  pendingCard: {
    opacity: 0.8,
  },
  pendingAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingIcon: {
    fontSize: 20,
    color: '#94a3b8',
  },
  removeIcon: {
    fontSize: 18,
    color: '#94a3b8',
  },
});
