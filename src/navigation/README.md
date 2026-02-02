/**
 * CivManager - Navigation README
 * Documentation for the navigation architecture
 */

# CivManager Navigation Architecture

## Overview

This navigation system follows enterprise-grade patterns for React Native + React Native Web applications.

## Structure

```
RootStack
├── Auth (Stack)
│   └── LoginScreen
│
└── Main (Bottom Tabs)
    ├── ProjectsTab (Stack)
    │   ├── ProjectListScreen
    │   ├── ProjectDetailScreen
    │   └── AddExpenseScreen
    │
    ├── DashboardTab (Stack)
    │   ├── FinancialDashboardScreen
    │   └── AuditLogsScreen
    │
    ├── ReportsTab (Stack)
    │   └── ReportsAndExportsScreen
    │
    └── ProfileTab (Stack)
        ├── ProfileScreen
        └── UserManagementScreen
```

## Core Principles

### 1. Navigation is Orchestration-Only
- No business logic in navigation
- No permission checks in navigation
- Navigation only handles screen transitions

### 2. No Role-Based Route Branching
- All routes are available to all authenticated users
- Role-based UI is handled INSIDE screens using role guards
- Single `ProjectDetailScreen` for all roles (not separate Owner/Supervisor screens)

### 3. Parameters Only Pass IDs
```typescript
// ✅ Correct
navigation.navigate('ProjectDetail', { projectId: 'proj-001' });

// ❌ Wrong - never pass objects
navigation.navigate('ProjectDetail', { project: projectObject });
```

### 4. ProjectContext Initialization
- `ProjectContext` is initialized inside `ProjectDetailScreen`
- The `projectId` from route params is passed to `ProjectProvider`
- All child components access project data via `useProject()` hook

## Type Safety

All navigation is fully typed:

```typescript
import type { ProjectDetailScreenProps } from '../navigation/types';

function ProjectDetailScreen() {
  const route = useRoute<ProjectDetailScreenProps['route']>();
  const navigation = useNavigation<ProjectDetailScreenProps['navigation']>();
  
  const { projectId } = route.params; // TypeScript knows this is string
}
```

## Role-Based UI (Inside Screens)

```typescript
import { useRoleGuard, OwnerOnly } from '../hooks/useRoleGuard';

function ProjectDetailScreen() {
  const { canAccessFinancials, showIf } = useRoleGuard();
  
  return (
    <View>
      {/* All users see this */}
      <ProjectHeader />
      <ExpenseList />
      
      {/* Only owners see this */}
      <OwnerOnly>
        <BudgetSection />
        <ProfitLossSection />
      </OwnerOnly>
      
      {/* Permission-based visibility */}
      {showIf(Permission.EXPORT_REPORTS) && <ExportButton />}
    </View>
  );
}
```

## Navigation Service

For programmatic navigation from outside React components:

```typescript
import NavigationService from '../navigation/NavigationService';

// Navigate to project detail
NavigationService.navigateToProjectDetail('proj-001');

// Navigate to add expense
NavigationService.navigateToAddExpense('proj-001');

// Navigate to dashboard
NavigationService.navigateToDashboard();
```

## Testing

All screens and tabs have `testID` props for Selenium/Appium testing:

- Tab buttons: `tab-projects`, `tab-dashboard`, `tab-reports`, `tab-profile`
- Screens: `project-list-screen`, `project-detail-screen`, etc.
- Components: `project-card-{id}`, `expense-item-{id}`, etc.

## Why This Structure?

1. **Single Source of Truth**: One `ProjectDetailScreen` instead of separate Owner/Supervisor screens eliminates code duplication and ensures consistent behavior.

2. **Separation of Concerns**: Navigation handles routing, screens handle UI, role guards handle visibility.

3. **Testability**: Consistent routes make automated testing predictable.

4. **Web Compatibility**: No conditional route registration means React Native Web works correctly.

5. **Maintainability**: Adding new roles doesn't require navigation changes, only role guard updates.

## DO NOT

- ❌ Add role-based route branching
- ❌ Pass objects as navigation params
- ❌ Add business logic to navigation
- ❌ Create duplicate screens for different roles
- ❌ Check permissions in navigation
