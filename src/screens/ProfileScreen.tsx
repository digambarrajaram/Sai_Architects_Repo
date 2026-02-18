import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const role = user?.role;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
          testID="profile-back-btn"
        >
          <Text style={styles.icon}>←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>My Profile</Text>

        <Pressable
          style={styles.iconBtn}
          testID="profile-edit-btn"
        >
          <Text style={styles.icon}>✎</Text>
        </Pressable>
      </View>

      {/* Content Wrapper */}
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Profile */}
          <View style={styles.profile}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JC</Text>
              </View>
              <View style={styles.verified}>
                <Text style={styles.verifiedIcon}>✔</Text>
              </View>
            </View>

            <Text style={styles.name}>James Carter</Text>
            <Text style={styles.phone}>+1 (555) 123-4567</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role}</Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Account</Text>

            <View style={styles.rowItem}>
              <View style={[styles.rowIcon, styles.blueBg]}>
                <Text style={styles.rowIconText}>🔔</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Notification Preferences</Text>
                <Text style={styles.rowSub}>
                  Manage push and email alerts
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowItem}>
              <View style={[styles.rowIcon, styles.greenBg]}>
                <Text style={styles.rowIconText}>🔒</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Security</Text>
                <Text style={styles.rowSub}>
                  Password, 2FA, and sessions
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowItem}>
              <View style={[styles.rowIcon, styles.purpleBg]}>
                <Text style={styles.rowIconText}>🌐</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Language & Region</Text>
                <Text style={styles.rowSub}>English (US)</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Support</Text>

            <View style={styles.rowItem}>
              <View style={[styles.rowIcon, styles.amberBg]}>
                <Text style={styles.rowIconText}>❓</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Help Center</Text>
                <Text style={styles.rowSub}>
                  FAQ and customer support
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.rowItem}>
              <View style={[styles.rowIcon, styles.grayBg]}>
                <Text style={styles.rowIconText}>📄</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Terms & Policy</Text>
                <Text style={styles.rowSub}>Legal information</Text>
              </View>
              <Text style={styles.chevron}>↗</Text>
            </View>
          </View>

          {/* Logout */}
          <Pressable
            style={styles.logoutBtn}
            onPress={logout}
            testID="logout-button"
          >
            <Text style={styles.logoutIcon}>⎋</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>

          <Text style={styles.version}>
            Version 2.4.0 (Build 302)
          </Text>

          <View style={{ height: 80 }} />
        </ScrollView>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {['Projects', 'Expenses', 'Reports', 'Settings'].map((label, i) => (
          <View key={label} style={styles.navItem}>
            <Text
              style={[
                styles.navIcon,
                i === 3 && styles.navIconActive,
              ]}
            >
              ●
            </Text>
            <Text
              style={[
                styles.navLabel,
                i === 3 && styles.navLabelActive,
              ]}
            >
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f6f7f8',
  },

  scrollView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBtn: {
    width: 40,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    color: '#64748b',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },

  content: {
    paddingHorizontal: 16,
  },

  profile: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#64748b',
  },
  verified: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#136dec',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedIcon: {
    color: '#fff',
    fontSize: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  phone: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  roleBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e0ebff',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#136dec',
    letterSpacing: 1,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 12,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },

  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconText: {
    fontSize: 16,
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginLeft: 68,
  },

  blueBg: { backgroundColor: '#e0ebff' },
  greenBg: { backgroundColor: '#dcfce7' },
  purpleBg: { backgroundColor: '#ede9fe' },
  amberBg: { backgroundColor: '#fef3c7' },
  grayBg: { backgroundColor: '#e5e7eb' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    marginTop: 8,
  },
  logoutIcon: {
    fontSize: 16,
    color: '#dc2626',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
  },

  version: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 8,
  },

  bottomNav: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    height: 64,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 10,
    color: '#94a3b8',
  },
  navIconActive: {
    color: '#136dec',
  },
  navLabel: {
    fontSize: 10,
    color: '#94a3b8',
  },
  navLabelActive: {
    color: '#136dec',
    fontWeight: '600',
  },
});
