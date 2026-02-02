/**
 * CivManager - App Navigator
 * Uses CANONICAL screens only (per audit report)
 * 
 * CANONICAL SCREENS:
 * - LoginScreen
 * - ProjectListScreen (handles role-based routing internally)
 * - ProjectDetailOwnerScreen
 * - ProjectDetailSupervisorScreen
 * - AddProjectExpenseScreen
 * - FinancialDashboardOwnerScreen
 * - OwnerAuditLogsAdminScreen
 * - ReportsAndExportsScreen
 * - ProfileScreen
 * - UserManagementScreen
 */

import React, { forwardRef, Ref } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

// Types
import type { RootStackParamList } from './types';

// Canonical Screens
import LoginScreen from '../screens/LoginScreen';
import ProjectListScreen from '../screens/ProjectListScreen';
import ProjectDetailOwnerScreen from '../screens/ProjectDetailOwnerScreen';
import ProjectDetailSupervisorScreen from '../screens/ProjectDetailSupervisorScreen';
import AddProjectExpenseScreen from '../screens/AddProjectExpenseScreen';
import FinancialDashboardOwnerScreen from '../screens/FinancialDashboardOwnerScreen';
import OwnerAuditLogsAdminScreen from '../screens/OwnerAuditLogsAdminScreen';
import ReportsAndExportsScreen from '../screens/ReportsAndExportsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserManagementScreen from '../screens/UserManagementScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = forwardRef<NavigationContainerRef<RootStackParamList>, {}>(
  (_props, ref: Ref<NavigationContainerRef<RootStackParamList>>) => {
    const { isAuthenticated, role } = useAuth();

    return (
      <NavigationContainer ref={ref}>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
        >
          {!isAuthenticated ? (
            <Stack.Screen name="Auth" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="ProjectList" component={ProjectListScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              
              {role === UserRole.OWNER ? (
                <>
                  <Stack.Screen name="ProjectDetailOwner" component={ProjectDetailOwnerScreen} />
                  <Stack.Screen name="ProjectDashboard" component={FinancialDashboardOwnerScreen} />
                  <Stack.Screen name="ProjectAuditLogs" component={OwnerAuditLogsAdminScreen} />
                  <Stack.Screen name="ProjectReports" component={ReportsAndExportsScreen} />
                  <Stack.Screen name="UserManagement" component={UserManagementScreen} />
                </>
              ) : (
                <>
                  <Stack.Screen name="ProjectDetailSupervisor" component={ProjectDetailSupervisorScreen} />
                </>
              )}
              <Stack.Screen name="AddExpense" component={AddProjectExpenseScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
);

export default AppNavigator;
