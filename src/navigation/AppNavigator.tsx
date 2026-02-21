import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { UserRole } from './types';
import { navigationRef } from './NavigationService';
import type { RootStackParamList } from './types';

/* Screens */
import LoginScreen from '../screens/LoginScreen';
import ProjectListScreen from '../screens/ProjectListScreen';
import ProjectDetailOwnerScreen from '../screens/ProjectDetailOwnerScreen';
import ProjectDetailSupervisorScreen from '../screens/ProjectDetailSupervisorScreen';
import AddProjectExpenseScreen from '../screens/AddProjectExpenseScreen';
import AddProjectScreen from '../screens/AddProjectScreen';
import FinancialDashboardOwnerScreen from '../screens/FinancialDashboardOwnerScreen';
import OwnerAuditLogsAdminScreen from '../screens/OwnerAuditLogsAdminScreen';
import ReportsAndExportsScreen from '../screens/ReportsAndExportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Projects Stack Navigator (contains ProjectList, ProjectDetail, AddExpense)
function ProjectsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectList" component={ProjectListScreen} />
      <Stack.Screen name="ProjectDetailOwner" component={ProjectDetailOwnerScreen} />
      <Stack.Screen name="ProjectDetailSupervisor" component={ProjectDetailSupervisorScreen} />
      <Stack.Screen name="AddExpense" component={AddProjectExpenseScreen} />
      <Stack.Screen name="AddProject" component={AddProjectScreen} />
    </Stack.Navigator>
  );
}

// Reports Stack Navigator
function ReportsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectReports" component={ReportsAndExportsScreen} />
    </Stack.Navigator>
  );
}

// Financial Dashboard Stack Navigator
function FinancialStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProjectDashboard" component={FinancialDashboardOwnerScreen} />
    </Stack.Navigator>
  );
}

// Settings Stack Navigator
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator for authenticated users
function MainTabs({ role }: { role: UserRole }) {
  return (
    <Tab.Navigator
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12 },
      }}
    >
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStack}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={ReportsStack}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="FinancialTab"
        component={FinancialStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size }}>💹</Text>,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Text style={{ fontSize: size }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, user, isAuthLoading } = useAuth();
  
  console.log('[AppNavigator] Rendering - isAuthenticated:', isAuthenticated, 'user:', user?.email, 'isAuthLoading:', isAuthLoading);

  // Get user role from user object (default to SUPERVISOR if null)
  const role = user?.role as UserRole || UserRole.SUPERVISOR;

  // Show branded loading screen during authentication transition
  if (isAuthLoading) {
    console.log('[AppNavigator] Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logo}>
          <Text style={styles.logoIcon}>🏗️</Text>
        </View>
        <Text style={styles.appName}>SAI ARCHITECT'S</Text>
        <Text style={styles.loadingText}>Loading your workspace...</Text>
        <ActivityIndicator size="small" color="#007bff" style={styles.spinner} />
      </View>
    );
  }

  console.log('[AppNavigator] Showing', isAuthenticated ? 'MainTabs' : 'LoginScreen');
  return (
    <NavigationContainer ref={navigationRef}>
      {!isAuthenticated ? (
        <LoginScreen />
      ) : (
        <MainTabs role={role} />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 36,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  spinner: {
    marginTop: 8,
  },
});
