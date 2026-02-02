---
description: Repository Information Overview
alwaysApply: true
---

# Sai_App (CivManager) Information

## Summary
**CivManager** is an enterprise-grade project and expense control application designed for construction and civil management. Built with **React Native** and **Expo**, it features a robust role-aware navigation system (supporting **OWNER** and **SUPERVISOR** roles), a project-centric data model, and comprehensive financial reporting.

## Structure
- [./src/navigation/](./src/navigation/): Core navigation implementation including [./src/navigation/AppNavigator.tsx](./src/navigation/AppNavigator.tsx), [./src/navigation/types.tsx](./src/navigation/types.tsx), and programmatic navigation services.
- [./src/screens/](./src/screens/): UI screens categorized by functionality:
    - **Authentication**: `LoginScreen.tsx`
    - **Project Management**: `ProjectListScreen.tsx`, `ProjectDetailOwnerScreen.tsx`, `ProjectDetailSupervisorScreen.tsx`, `AddProjectExpenseScreen.tsx`.
    - **Finance & Analytics**: `OwnerFinancialDashboardScreen.tsx`, `FinancialDashboardOwnerScreen.tsx`, `OwnerAuditLogsAdminScreen.tsx`, `ReportsAndExportsScreen.tsx`.
    - **System**: `UserManagementScreen.tsx`, `ProfileScreen.tsx`.
- [./src/theme/](./src/theme/): Centralized styling and color definitions in `colors.ts`.
- [./test/](./test/): Frontend E2E tests using Selenium/Python and diagnostic utilities.

## Language & Runtime
**Language**: TypeScript  
**Version**: Node.js >= 18  
**React Version**: 19.1.0  
**React Native**: 0.81.5  
**Expo Version**: ~54.0.32  
**Build System**: Expo (Metro Bundler)  
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- `expo`: Core framework
- `react-native`: Mobile runtime
- `react-native-paper`: UI Component library
- `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`: Navigation suite
- `react-native-gesture-handler`, `react-native-safe-area-context`, `react-native-screens`: Native UI primitives
- `react-native-svg`, `react-native-vector-icons`: Iconography and graphics
- `date-fns`, `lodash`: Utility libraries

**Development Dependencies**:
- `typescript`: Language support
- `jest`, `jest-expo`: Unit and integration testing
- `eslint`: Code quality and linting
- `@babel/core`: JavaScript transformation

## Build & Installation
```bash
# Install dependencies
npm install

# Start development server (Expo)
npm run start

# Platform-specific starts
npm run android
npm run ios
npm run web
```

## Testing

**Framework**: Jest (Unit/Integration), Selenium (E2E)
**Test Location**: [./test/](./test/) for E2E; standard Jest patterns for unit tests.
**Naming Convention**: `*.test.ts`, `*.test.tsx`, `test_*.py`
**Configuration**: [./tsconfig.json](./tsconfig.json) (TypeScript), [./package.json](./package.json) (Jest)

**Run Command**:
```bash
# Run Jest tests
npm run test

# Run E2E tests (requires web server running at localhost:8081)
python test/test_frontend_e2e.py

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Main Files & Resources
- [./App.tsx](./App.tsx): Application root component and provider setup.
- [./index.ts](./index.ts): Centralized navigation and type exports.
- [./package.json](./package.json): Project metadata and script definitions.
- [./NAVIGATION_SUMMARY.md](./NAVIGATION_SUMMARY.md): Comprehensive guide to the navigation architecture.
- [./src/navigation/types.tsx](./src/navigation/types.tsx): Single source of truth for app routes and parameters.
