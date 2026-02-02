# CivManager Architecture Documentation

## Overview

This document describes the production-grade architecture for CivManager, a project-centric civil engineering mobile app built with React Native and TypeScript.

## Folder Structure

```
src/
├── components/
│   ├── common/                 # Reusable UI components
│   │   ├── LoadingState.tsx    # Loading indicators, skeletons
│   │   ├── ErrorState.tsx      # Error displays, network errors
│   │   ├── EmptyState.tsx      # Empty state displays
│   │   └── index.ts
│   └── project/                # Project-specific components
│       ├── ProjectCard.tsx     # Project list item
│       ├── ExpenseItem.tsx     # Expense list item
│       └── index.ts
├── context/
│   ├── AuthContext.tsx         # Authentication state
│   ├── ProjectContext.tsx      # Project-scoped state
│   └── index.ts
├── hooks/
│   ├── useRoleGuard.tsx        # Role-based visibility
│   ├── useAsyncState.ts        # Async state management
│   └── index.ts
├── navigation/
│   ├── AppNavigator.tsx        # Main navigator (DO NOT MODIFY)
│   ├── NavigationService.tsx   # Navigation utilities
│   ├── types.tsx               # Navigation types
│   └── README.md
├── screens/                    # Screen components
├── services/
│   ├── projectService.ts       # Project data operations
│   ├── expenseService.ts       # Expense data operations
│   ├── exportService.ts        # Export/report generation
│   ├── auditLogService.ts      # Audit log operations
│   └── index.ts
├── theme/
│   └── colors.ts               # Color definitions
├── types/
│   ├── index.ts                # Core type definitions
│   └── screens.ts              # Screen prop types
└── utils/
    ├── permissions.ts          # Permission utilities
    └── index.ts
```

## Core Principles

### 1. Project-Centric Design
- Projects are parent entities
- Expenses always belong to a project
- No global expense views
- Calculations are project-first

### 2. Role-Based Visibility (Not Routes)
- Roles affect UI visibility, not navigation structure
- Use `useRoleGuard` hook or `RoleGuard` component
- Screens ask for permissions, not roles directly

### 3. Screen Contract Stabilization
- Every screen has strict TypeScript props
- Screens rely ONLY on route params + context
- No screen may alter navigation structure

## Key Components

### ProjectContext

Provides project-scoped state to all project-dependent screens:

```typescript
import { useProject } from '../context';

function MyScreen() {
  const { 
    project, 
    expenses, 
    totals, 
    permissions,
    addExpense,
    refreshProject 
  } = useProject();
}
```

### Role Guard

For conditional UI rendering based on permissions:

```typescript
import { useRoleGuard, OwnerOnly, RoleGuard } from '../hooks';
import { Permission } from '../types';

function MyScreen() {
  const { canAccessFinancials, showIf } = useRoleGuard();
  
  return (
    <View>
      {/* Using hook */}
      {showIf(Permission.VIEW_BUDGET) && <BudgetSection />}
      
      {/* Using component */}
      <OwnerOnly>
        <ProfitLossSection />
      </OwnerOnly>
      
      <RoleGuard permission={Permission.EXPORT_REPORTS}>
        <ExportButton />
      </RoleGuard>
    </View>
  );
}
```

### Loading/Error/Empty States

Mandatory for every screen:

```typescript
import { LoadingState, ErrorState, EmptyExpenses } from '../components/common';

function ExpenseListScreen() {
  const { expenses, loading, error } = useProject();
  
  if (loading) return <LoadingState message="Loading expenses..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;
  if (expenses.length === 0) return <EmptyExpenses onAddExpense={handleAdd} />;
  
  return <ExpenseList expenses={expenses} />;
}
```

## Services (Data Access Layer)

All data operations go through services:

```typescript
import { projectService, expenseService, exportService } from '../services';

// Get projects
const projects = await projectService.getAllProjects();

// Add expense
const expense = await expenseService.createExpense({ ... });

// Generate report
const report = await exportService.exportReport({
  format: 'PDF',
  filter: { projectId, dateRange: 'monthly' }
});
```

## Export Architecture

Supports PDF, CSV, and Excel exports with filters:

```typescript
import { exportService } from '../services';

// Available filters
const filters = exportService.getDateRangeFilters();
// ['daily', 'weekly', 'monthly', 'yearly', 'custom']

// Export report
const result = await exportService.exportReport({
  format: 'PDF',
  filter: {
    projectId: 'proj-001',
    dateRange: 'monthly',
    categories: [ExpenseCategory.LABOR, ExpenseCategory.MATERIALS]
  },
  includeCharts: true,
  includeSummary: true
});
```

## UI Testing Readiness

All components include:
- `testID` props for Selenium/Appium
- Fixed minimum heights (no dynamic collapse)
- No hidden overflow issues
- Consistent accessibility labels

```typescript
<ProjectCard
  project={project}
  testID="project-card-001"
  onPress={handlePress}
/>
```

## Permission System

Centralized permission logic:

```typescript
// Permission enum
enum Permission {
  VIEW_BUDGET,
  EDIT_BUDGET,
  VIEW_PROFIT_LOSS,
  ADD_EXPENSE,
  VIEW_AUDIT_LOGS,
  EXPORT_REPORTS,
  // ...
}

// Role-permission mapping
OWNER: [VIEW_BUDGET, EDIT_BUDGET, VIEW_PROFIT_LOSS, VIEW_AUDIT_LOGS, EXPORT_REPORTS, ...]
SUPERVISOR: [VIEW_EXPENSES, ADD_EXPENSE, VIEW_REPORTS]
ADMIN: [MANAGE_USERS, VIEW_SYSTEM_LOGS, VIEW_AUDIT_LOGS]
```

## State Management

### Local First
- Use `useState` / `useReducer` inside screens
- Promote to context ONLY if reused

### Async State Hook
```typescript
import { useAsyncState, useAsyncList } from '../hooks';

// Single value
const { data, loading, error, execute } = useAsyncState<Project>();
await execute(() => projectService.getProjectById(id));

// List with pagination
const { items, loadMore, refresh, hasMore } = useAsyncList<Expense>();
```

## DO NOT

- ❌ Change routes or navigation structure
- ❌ Add new navigators
- ❌ Add Redux (unless explicitly justified)
- ❌ Add backend APIs
- ❌ Put navigation logic in components
- ❌ Put business logic in components
