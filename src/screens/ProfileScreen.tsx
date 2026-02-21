import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const role = user?.role;

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => signOut(),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          testID="profile-back-btn"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Back</Text>
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
                <Pressable style={styles.cameraBtn}>
                  <Text style={styles.cameraIcon}>📷</Text>
                </Pressable>
              </View>
              <View style={styles.verified}>
                <Text style={styles.verifiedIcon}>✔</Text>
              </View>
            </View>

            <Text style={styles.name}>James Carter</Text>
            <Text style={styles.phone}>+1 (555) 123-4567</Text>
            <Text style={styles.email}>owner@gmail.com</Text>

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
                <Text style={styles.rowSub}>English (IN) • INR (₹)</Text>
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
              <View style={[styles.rowIcon, styles.slateBg]}>
                <Text style={styles.rowIconText}>📋</Text>
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
            onPress={handleLogout}
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  backIcon: {
    fontSize: 18,
    color: '#3b82f6',
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
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
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cameraIcon: {
    fontSize: 16,
  },
  email: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
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
  slateBg: { backgroundColor: '#cbd5e1' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutIcon: {
    fontSize: 16,
    color: '#64748b',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
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
