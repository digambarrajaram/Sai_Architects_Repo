# CivManager Screen Audit Report

## STEP 1 — SCREEN INVENTORY

| File Name | Purpose | Role Relevance | Route Params | Navigation Targets |
|-----------|---------|----------------|--------------|-------------------|
| `LoginScreen.tsx` | Authentication login | Both | None | ProjectList |
| `ProjectListScreen.tsx` | List all projects | Both | None | ProjectDetailOwner/Supervisor, Profile |
| `ProjectListScreen1.tsx` | List projects (variant) | Both | None | None (no navigation) |
| `ProjectListGridScreen.tsx` | Grid view of projects | Both | None | None (no navigation) |
| `ProjectDetailOwnerScreen.tsx` | Project detail for Owner | Owner | `projectId` | Dashboard, AuditLogs, Reports, AddExpense |
| `ProjectDetailSupervisorScreen.tsx` | Project detail for Supervisor | Supervisor | `projectId` | AddExpense |
| `OwnerProjectDetailScreen.tsx` | Project detail (variant) | Owner | None (hardcoded) | None |
| `SupervisorProjectDetailScreen.tsx` | Project detail (variant) | Supervisor | None (hardcoded) | None |
| `ProjectDetailScreen.tsx` | Unified project detail | Both | `projectId` | AddExpense, Dashboard, AuditLogs, Reports |
| `AddProjectExpenseScreen.tsx` | Add expense to project | Both | `projectId` | goBack |
| `FinancialDashboardOwnerScreen.tsx` | Financial dashboard | Owner | None | Profile, goBack |
| `OwnerFinancialDashboardScreen.tsx` | Financial dashboard (variant) | Owner | None | None |
| `FinancialDashboardScreen.tsx` | Unified dashboard | Owner | None | None |
| `OwnerAuditLogsAdminScreen.tsx` | Audit logs | Owner/Admin | None | goBack |
| `AuditLogsScreen.tsx` | Unified audit logs | Owner/Admin | `projectId?` | None |
| `ReportsAndExportsScreen.tsx` | Reports & exports | Owner | None | goBack |
| `ProfileScreen.tsx` | User profile | Both | None | goBack |
| `UserManagementScreen.tsx` | Manage team users | Admin | None | goBack |

---

## STEP 2 — DUPLICATE DETECTION

### Project List Screens (3 duplicates)

| File | Status | Reason |
|------|--------|--------|
| `ProjectListScreen.tsx` | **KEEP** | Has navigation, testIDs, role-based routing |
| `ProjectListScreen1.tsx` | DEPRECATE | No navigation, no testIDs, static UI only |
| `ProjectListGridScreen.tsx` | DEPRECATE | Alternative layout, no navigation, incomplete |

**Why overlap:** Multiple UI iterations during development. `ProjectListScreen.tsx` is the only functional version.

### Project Detail Screens (5 duplicates!)

| File | Status | Reason |
|------|--------|--------|
| `ProjectDetailOwnerScreen.tsx` | **KEEP** | Has navigation, testIDs, route params |
| `ProjectDetailSupervisorScreen.tsx` | **KEEP** | Has navigation, testIDs, route params |
| `OwnerProjectDetailScreen.tsx` | DEPRECATE | No route params, hardcoded data |
| `SupervisorProjectDetailScreen.tsx` | DEPRECATE | No route params, hardcoded data |
| `ProjectDetailScreen.tsx` | DEPRECATE | Created by me, not original |

**Why overlap:** 
- `OwnerProjectDetailScreen` and `SupervisorProjectDetailScreen` are static mockups without navigation
- `ProjectDetailOwnerScreen` and `ProjectDetailSupervisorScreen` are the functional versions
- `ProjectDetailScreen` was created during this session (should be removed)

**Recommendation:** Keep `ProjectDetailOwnerScreen` and `ProjectDetailSupervisorScreen` as they are currently referenced in navigation. The role-based routing is in `ProjectListScreen.tsx`.

### Financial Dashboard Screens (3 duplicates)

| File | Status | Reason |
|------|--------|--------|
| `FinancialDashboardOwnerScreen.tsx` | **KEEP** | Has navigation, testIDs, functional |
| `OwnerFinancialDashboardScreen.tsx` | DEPRECATE | No navigation, static mockup |
| `FinancialDashboardScreen.tsx` | DEPRECATE | Created by me, not original |

**Why overlap:** `OwnerFinancialDashboardScreen` is a static mockup. `FinancialDashboardScreen` was created during this session.

### Audit Logs Screens (2 duplicates)

| File | Status | Reason |
|------|--------|--------|
| `OwnerAuditLogsAdminScreen.tsx` | **KEEP** | Has navigation, testIDs, functional |
| `AuditLogsScreen.tsx` | DEPRECATE | Created by me, not original |

---

## STEP 3 — CANONICAL SCREEN DECISIONS

| Responsibility | Canonical Screen | Justification |
|----------------|------------------|---------------|
| **Project List** | `ProjectListScreen.tsx` | Only version with navigation and testIDs |
| **Project Detail (Owner)** | `ProjectDetailOwnerScreen.tsx` | Has route params, navigation to dashboard/audit/reports |
| **Project Detail (Supervisor)** | `ProjectDetailSupervisorScreen.tsx` | Has route params, limited navigation |
| **Add Expense** | `AddProjectExpenseScreen.tsx` | Only version, has route params |
| **Financial Dashboard** | `FinancialDashboardOwnerScreen.tsx` | Has navigation, testIDs |
| **Audit Logs** | `OwnerAuditLogsAdminScreen.tsx` | Has navigation, testIDs |
| **Reports** | `ReportsAndExportsScreen.tsx` | Only version |
| **Profile** | `ProfileScreen.tsx` | Only version |
| **User Management** | `UserManagementScreen.tsx` | Only version |
| **Login** | `LoginScreen.tsx` | Only version |

---

## STEP 4 — NAVIGATION ALIGNMENT

The original `AppNavigator.tsx` should be restored to use the canonical screens:

```diff
// src/navigation/AppNavigator.tsx

- import ProjectDetailScreen from '../screens/ProjectDetailScreen';
- import FinancialDashboardScreen from '../screens/FinancialDashboardScreen';
- import AuditLogsScreen from '../screens/AuditLogsScreen';

+ import ProjectDetailOwnerScreen from '../screens/ProjectDetailOwnerScreen';
+ import ProjectDetailSupervisorScreen from '../screens/ProjectDetailSupervisorScreen';
+ import FinancialDashboardOwnerScreen from '../screens/FinancialDashboardOwnerScreen';
+ import OwnerAuditLogsAdminScreen from '../screens/OwnerAuditLogsAdminScreen';
```

**Required Navigation Structure (using existing screens):**

```typescript
// Auth flow
Auth → LoginScreen

// Main flow (role-based routing in ProjectListScreen)
ProjectList → ProjectListScreen
  ├── ProjectDetailOwner → ProjectDetailOwnerScreen (Owner)
  │     ├── ProjectDashboard → FinancialDashboardOwnerScreen
  │     ├── ProjectAuditLogs → OwnerAuditLogsAdminScreen
  │     └── ProjectReports → ReportsAndExportsScreen
  └── ProjectDetailSupervisor → ProjectDetailSupervisorScreen (Supervisor)

AddExpense → AddProjectExpenseScreen
Profile → ProfileScreen
UserManagement → UserManagementScreen
```

---

## STEP 5 — FILE STRUCTURE VALIDATION

Current structure is acceptable. No restructuring needed.

```
src/screens/
├── LoginScreen.tsx ✓
├── ProjectListScreen.tsx ✓
├── ProjectDetailOwnerScreen.tsx ✓
├── ProjectDetailSupervisorScreen.tsx ✓
├── AddProjectExpenseScreen.tsx ✓
├── FinancialDashboardOwnerScreen.tsx ✓
├── OwnerAuditLogsAdminScreen.tsx ✓
├── ReportsAndExportsScreen.tsx ✓
├── ProfileScreen.tsx ✓
├── UserManagementScreen.tsx ✓
└── [deprecated files - see below]
```

---

## STEP 6 — FILES SAFE TO DELETE (RECOMMENDATION ONLY)

**DO NOT DELETE AUTOMATICALLY** — These are recommendations for manual cleanup:

| File | Reason |
|------|--------|
| `ProjectListScreen1.tsx` | Static mockup, no navigation |
| `ProjectListGridScreen.tsx` | Alternative layout, incomplete |
| `OwnerProjectDetailScreen.tsx` | Static mockup, no route params |
| `SupervisorProjectDetailScreen.tsx` | Static mockup, no route params |
| `OwnerFinancialDashboardScreen.tsx` | Static mockup, no navigation |
| `ProjectDetailScreen.tsx` | Created during this session, not original |
| `FinancialDashboardScreen.tsx` | Created during this session, not original |
| `AuditLogsScreen.tsx` | Created during this session, not original |

---

## FINAL CONFIRMATION CHECKLIST

- [x] Screen inventory completed (18 screens analyzed)
- [x] Duplicate detection completed (8 duplicates identified)
- [x] Canonical screens selected (10 canonical screens)
- [x] Navigation alignment documented
- [x] File structure validated
- [x] Deletion recommendations provided

### Summary

| Category | Count |
|----------|-------|
| Total screens | 18 |
| Canonical screens | 10 |
| Duplicates to deprecate | 8 |
| Navigation changes needed | Restore original imports |

### Action Items

1. **Restore original AppNavigator.tsx** - Use the canonical screens listed above
2. **Do not delete files** - Mark deprecated files for future cleanup
3. **Keep role-based routing** - The existing pattern in `ProjectListScreen.tsx` is correct
4. **Preserve testIDs** - All canonical screens have testIDs for Selenium testing
