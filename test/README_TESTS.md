# CivManager QA Test Suite - Execution Instructions

## ⚠️ Important: Testing Framework Notice

**This is a React Native/Expo app.** The original Selenium tests in this directory are designed for web applications and will NOT work with React Native.

**Use the Detox E2E tests in the `/e2e` directory for mobile testing.**

---

## Overview

This directory contains the legacy Selenium test suite. For React Native mobile testing, use the Detox tests in the `/e2e` directory.

## Detox E2E Testing (Recommended for React Native)

### Prerequisites

#### For iOS
- macOS with Xcode
- iOS Simulator (iPhone 15 recommended)
- CocoaPods

#### For Android
- Android SDK
- Android Emulator (Pixel 6 API 31 recommended)
- Java Development Kit (JDK) 11+

### Installation

```bash
# Install Detox and dependencies
npm install -D detox jest-environment-miniflare

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### Running Detox Tests

#### iOS Simulator
```bash
# Build the app for iOS
npm run build:ios

# Run tests on iOS simulator
npm run test:e2e:ios
```

#### Android Emulator
```bash
# Build the app for Android
npm run build:android

# Run tests on Android emulator
npm run test:e2e:android
```

### Test Files

| File | Purpose |
|------|---------|
| `e2e/auth.test.js` | Login, authentication, redirect to projects |
| `e2e/project.test.js` | Project list, selection, detail view |
| `e2e/expense.test.js` | Add expense, expense list, submission |
| `e2e/navigation.test.js` | Tab navigation, back navigation |
| `e2e/roleVisibility.test.js` | Role-based UI visibility |

### Required testID Attributes

For Detox to work properly, ensure these `testID` props are added to components:

#### LoginScreen.tsx (Already configured)
- `testID="username-input"` on TextInput
- `testID="password-input"` on TextInput  
- `testID="login-button"` on Pressable

#### ProjectListScreen.tsx
- `testID="projects-title"` on the title Text
- `testID="projects-list"` on the list container
- `testID="project-card-{index}"` on each project card
- `testID="project-name-{index}"` on project name
- `testID="project-status-{index}"` on project status

#### ProjectDetailOwnerScreen.tsx
- `testID="project-detail-screen"` on the screen container
- `testID="expense-list"` on the expense list
- `testID="add-expense-fab"` on the FAB button
- `testID="expense-item-{index}"` on each expense item
- `testID="back-button"` on navigation back button

#### ProfileScreen.tsx
- `testID="profile-screen"` on the screen container
- `testID="profile-avatar"` on avatar component
- `testID="logout-button"` on logout button
- `testID="user-management-option"` on user management menu item
- `testID="audit-logs-option"` on audit logs menu item
- `testID="owner-dashboard-option"` on owner dashboard menu item
- `testID="supervisor-dashboard-option"` on supervisor dashboard menu item

---

## Legacy Selenium Tests (Deprecated)

The following information is for reference only. These tests will not work with React Native.

### System Requirements
- Python 3.8+
- Chrome/Chromium browser
- ChromeDriver (matching Chrome version)

### Python Dependencies
```bash
pip install selenium pytest pytest-xdist
```

### Execution (Deprecated)
```bash
cd test
pytest -v --tb=short
```

---

## Troubleshooting

### Detox Issues

#### "Unable to find element"
Ensure the `testID` prop is set on the component:
```tsx
<TextInput testID="username-input" />
```

#### "App failed to load"
Check that the app is properly built:
```bash
# For iOS
cd ios && xcodebuild -workspace Sai_App.xcworkspace -scheme Sai_App -configuration Debug -sdk iphonesimulator

# For Android
cd android && ./gradlew assembleDebug
```

#### "Device not found"
Ensure the emulator/simulator is running:
```bash
# iOS
xcrun simctl list devices available

# Android
emulator -avd Pixel_6_API_31
```

---

## CI/CD Integration

### GitHub Actions for Detox (iOS Example)
```yaml
name: Detox E2E Tests

on: [push, pull_request]

jobs:
  ios-test:
    runs-on: macos-14
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup iOS Simulator
        run: |
          xcrun simctl list devices available
          xcrun simctl boot "iPhone 15"
      
      - name: Build iOS App
        run: npm run build:ios
      
      - name: Run Detox Tests
        run: npm run test:e2e:ios
```
