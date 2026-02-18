import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

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

export default function AppNavigator() {
  const { isAuthenticated, user } = useAuth();

  // Get user role from user object (default to SUPERVISOR if null)
  const role = user?.role || UserRole.SUPERVISOR;

  return (
    <NavigationContainer ref={navigationRef}>
      {/* Key prop ensures navigator resets when auth state changes */}
      <Stack.Navigator 
        key={isAuthenticated ? 'authenticated' : 'unauthenticated'}
        screenOptions={{ headerShown: false }}
      >
        {!isAuthenticated ? (
          <Stack.Screen 
            name="Auth" 
            component={LoginScreen} 
            options={{ title: 'Login', headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="ProjectList" 
              component={ProjectListScreen} 
              options={{ 
                title: 'Projects', 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen} 
              options={{ 
                title: 'Profile', 
                headerShown: false,
              }}
            />
            <Stack.Screen 
              name="AddProject" 
              component={AddProjectScreen} 
              options={{ 
                title: 'New Project', 
                headerShown: false,
              }}
            />

            {role === UserRole.OWNER ? (
              <>
                <Stack.Screen 
                  name="ProjectDetailOwner" 
                  component={ProjectDetailOwnerScreen} 
                  options={{ title: 'Project Details', headerShown: false }}
                />
                <Stack.Screen 
                  name="ProjectDashboard" 
                  component={FinancialDashboardOwnerScreen} 
                  options={{ 
                    title: 'Dashboard', 
                    headerShown: false,
                  }}
                />
                <Stack.Screen 
                  name="ProjectAuditLogs" 
                  component={OwnerAuditLogsAdminScreen} 
                  options={{ title: 'Audit Logs', headerShown: false }}
                />
                <Stack.Screen 
                  name="ProjectReports" 
                  component={ReportsAndExportsScreen} 
                  options={{ 
                    title: 'Reports', 
                    headerShown: false,
                  }}
                />
                <Stack.Screen 
                  name="UserManagement" 
                  component={UserManagementScreen} 
                  options={{ title: 'User Management', headerShown: false }}
                />
              </>
            ) : (
              <Stack.Screen
                name="ProjectDetailSupervisor"
                component={ProjectDetailSupervisorScreen}
                options={{ title: 'Project Details', headerShown: false }}
              />
            )}

            <Stack.Screen 
              name="AddExpense" 
              component={AddProjectExpenseScreen} 
              options={{ title: 'Add Expense', headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
