# Supabase Integration Testing Guide

This document provides comprehensive guidance for testing the Supabase integration in the CivManager application.

## Overview

The test suite includes multiple levels of testing to ensure robust Supabase integration:

1. **Unit Tests** - Test individual components and services
2. **Integration Tests** - Test Supabase backend connectivity
3. **End-to-End Tests** - Test complete user workflows
4. **Performance Tests** - Test API response times and concurrent operations

## Test Structure

```
tests/
├── testsuites/
│   ├── test_supabase_integration.py    # Basic Supabase connectivity tests
│   ├── test_e2e_supabase.py           # Complete E2E workflow tests
│   ├── test_app_launch.py             # App launch verification
│   ├── test_login_flow.py             # Login functionality
│   └── test_navigation.py             # Navigation testing
├── pages/                             # Page Object Model classes
├── utils/                             # Test utilities and helpers
├── config/                            # Test configuration
└── requirements.txt                   # Python dependencies
```

## Test Categories

### 1. Supabase Integration Tests (`test_supabase_integration.py`)

**Purpose**: Verify basic Supabase connectivity and configuration

**Tests Include**:
- Configuration loading verification
- App initialization with Supabase
- Network connectivity checks
- Supabase client initialization
- API endpoint accessibility
- Authentication flow testing
- Data operation verification
- Error handling and resilience

**Run Command**:
```bash
npm run test:integration
# or
pytest tests/testsuites/test_supabase_integration.py -v
```

### 2. End-to-End Tests (`test_supabase_e2e.py`)

**Purpose**: Single comprehensive test file for complete user workflows with real Supabase backend

**Tests Include**:
- **Test 1**: Supabase configuration verification
- **Test 2**: App initialization with Supabase backend
- **Test 3**: Complete authentication flow with real database user
- **Test 4**: Project data retrieval from actual Supabase database
- **Test 5**: Complete expense creation workflow with Supabase backend
- **Test 6**: Data synchronization between frontend and backend
- **Test 7**: Error handling and app resilience
- **Test 8**: Performance verification of API responses

**Run Command**:
```bash
npm run test:e2e
# or
pytest tests/testsuites/test_supabase_e2e.py -v
```

**Step-by-Step Testing**:
```bash
# Run specific test steps
npm run test:step-by-step
# or
pytest tests/testsuites/test_supabase_e2e.py::TestSupabaseE2E::test_01_supabase_configuration -v
pytest tests/testsuites/test_supabase_e2e.py::TestSupabaseE2E::test_03_authentication_flow -v
```

## Test Scripts

### NPM Scripts

```bash
# Test Supabase connection only
npm run test:supabase

# Test basic connection
npm run test:connection

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run all Supabase tests
npm run test:all

# Run all tests (including linting and type checking)
npm run check-all
```

### Direct Python Commands

```bash
# Run specific test class
pytest tests/testsuites/test_e2e_supabase.py::TestE2ESupabaseIntegration -v

# Run specific test method
pytest tests/testsuites/test_e2e_supabase.py::TestE2ESupabaseIntegration::test_full_authentication_flow -v

# Run with HTML report
pytest tests/testsuites/test_e2e_supabase.py --html=supabase_e2e_report.html -v

# Run with detailed logging
pytest tests/testsuites/test_e2e_supabase.py -v -s --log-cli-level=INFO

# Run performance tests only
pytest tests/testsuites/test_e2e_supabase.py::TestSupabasePerformance -v

# Run with parallel execution (if xdist installed)
pytest tests/testsuites/test_e2e_supabase.py -n auto -v
```

## Prerequisites

### For Appium Tests (E2E)

1. **Android Development Environment**:
   - Android SDK installed
   - ADB (Android Debug Bridge) configured
   - Physical Android device connected via USB or emulator running

2. **Appium Server**:
   ```bash
   npm install -g appium
   appium server
   ```

3. **Python Dependencies**:
   ```bash
   pip install -r tests/requirements.txt
   ```

### For Supabase Tests

1. **Supabase Project**:
   - Supabase project created and configured
   - Authentication enabled (for auth tests)
   - Database tables for projects and expenses
   - RPC functions for data operations
   - Row Level Security (RLS) policies

2. **Environment Variables**:
   Ensure `.env` file contains:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Test Data**:
   - **For Authentication Tests**: Create test user accounts in Supabase Auth
   - **For Data Tests**: Sample project and expense data in database
   - **For Demo Mode**: Tests can run with mock data if no real credentials available

4. **Authentication Testing Options**:
   - **Real Authentication**: Use actual test user credentials
   - **Demo Mode**: Tests skip authentication and test data operations directly
   - **Mock Mode**: Use mock authentication for unit testing

## Test Configuration

### Environment Setup

1. **Install Dependencies**:
   ```bash
   npm install
   pip install -r tests/requirements.txt
   ```

2. **Start Appium Server**:
   ```bash
   appium
   ```

3. **Build and Run App**:
   ```bash
   npm run android
   # or
   npm start
   ```

### Test Configuration Files

- `tests/pytest.ini` - Pytest configuration
- `tests/config/capabilities.py` - Appium capabilities
- `tests/conftest.py` - Test fixtures and setup

## Test Execution

### Quick Start

1. **Start Appium Server**:
   ```bash
   appium
   ```

2. **Run All Supabase Tests**:
   ```bash
   npm run test:all
   ```

3. **View Results**:
   - Console output shows test results
   - Screenshots saved in `tests/screenshots/`
   - HTML reports generated in `tests/reports/`

### Detailed Test Execution

#### 1. Basic Supabase Tests

```bash
# Test configuration and connectivity
npm run test:supabase

# Expected output:
# 🧪 CivManager Supabase Test Suite
# =====================================
# 1. Testing Supabase Configuration...
#    Status: ✅ PASS
#    Details: Environment variables loaded
# 2. Testing Supabase Connection...
#    Status: ✅ PASS
#    Details: Successfully connected to Supabase
# =====================================
# 🎉 All Supabase tests completed successfully!
```

#### 2. Integration Tests

```bash
# Run integration tests
npm run test:integration

# Tests verify:
# - App initialization with Supabase
# - Network connectivity
# - Client initialization
# - API accessibility
# - Error handling
```

#### 3. End-to-End Tests

```bash
# Run E2E tests (requires Appium and device)
npm run test:e2e

# Tests verify:
# - Complete authentication flow
# - Project data retrieval
# - Expense creation workflow
# - Data synchronization
# - Error handling and resilience
```

## Test Markers

Tests are categorized using pytest markers:

```bash
# Run only Supabase tests
pytest -m supabase

# Run only integration tests
pytest -m integration

# Run only E2E tests
pytest -m e2e

# Run only performance tests
pytest -m performance

# Run tests for specific user roles
pytest -k "owner"
pytest -k "supervisor"
pytest -k "worker"
```

## Expected Test Results

### Successful Test Run

```
============================= test session starts ==============================
platform linux -- Python 3.x.x
collected 15 items

tests/testsuites/test_supabase_integration.py::TestSupabaseIntegration::test_supabase_configuration_loaded PASSED
tests/testsuites/test_supabase_integration.py::TestSupabaseIntegration::test_app_initialization_with_supabase PASSED
tests/testsuites/test_supabase_integration.py::TestSupabaseIntegration::test_network_connectivity_for_supabase PASSED
tests/testsuites/test_supabase_integration.py::TestSupabaseIntegration::test_supabase_client_initialization PASSED
tests/testsuites/test_supabase_integration.py::TestSupabaseAPIIntegration::test_api_endpoint_accessibility PASSED
tests/testsuites/test_supabase_integration.py::TestSupabaseAPIIntegration::test_authentication_flow_with_supabase PASSED
tests/testsuites/test_supabase_integration.py::TestSupabaseDataOperations::test_project_data_access PASSED
tests/testsuites/test_supabase_integration.py::TestSupabaseErrorHandling::test_offline_mode_handling PASSED
tests/testsuites/test_supabase_integration.py::TestSupabaseErrorHandling::test_supabase_timeout_handling PASSED
tests/testsuites/test_e2e_supabase.py::TestE2ESupabaseIntegration::test_full_authentication_flow PASSED
tests/testsuites/test_e2e_supabase.py::TestE2ESupabaseIntegration::test_project_data_retrieval PASSED
tests/testsuites/test_e2e_supabase.py::TestE2ESupabaseIntegration::test_expense_creation_workflow PASSED
tests/testsuites/test_e2e_supabase.py::TestE2ESupabaseIntegration::test_data_synchronization PASSED
tests/testsuites/test_e2e_supabase.py::TestE2ESupabaseIntegration::test_error_handling_and_resilience PASSED
tests/testsuites/test_e2e_supabase.py::TestSupabasePerformance::test_api_response_times PASSED

============================== 15 passed in 45.23s ==============================
```

### Common Test Failures and Solutions

#### 1. Connection Failures
```
FAILED - Network connectivity check failed
```
**Solution**: Check internet connection and Supabase project status

#### 2. Authentication Failures
```
FAILED - Login failed with error: Invalid credentials
```
**Solution**: Verify test credentials in test configuration

#### 3. App Launch Failures
```
FAILED - Login page failed to load
```
**Solution**: Ensure app is properly built and device is connected

#### 4. Data Retrieval Failures
```
FAILED - No projects found - Supabase data retrieval may have failed
```
**Solution**: Verify test data exists in Supabase database

## Continuous Integration

### GitHub Actions Example

```yaml
name: Supabase Integration Tests

on: [push, pull_request]

jobs:
  supabase-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Install Python dependencies
        run: pip install -r tests/requirements.txt
      - name: Start Appium
        run: appium &
      - name: Run Supabase tests
        run: npm run test:all
```

### Test Reports

Test results are automatically saved to:
- `tests/reports/report.html` - HTML test report
- `tests/screenshots/` - Test execution screenshots
- `tests/logs/` - Detailed test logs

## Troubleshooting

### Common Issues

1. **Appium Server Not Running**
   ```bash
   # Start Appium server
   appium
   ```

2. **Device Not Connected**
   ```bash
   # Check device connection
   adb devices
   ```

3. **Supabase Connection Issues**
   - Verify `.env` file has correct credentials
   - Check Supabase project status
   - Verify network connectivity

4. **Test Data Missing**
   - Ensure test data exists in Supabase
   - Check database permissions and RLS policies

### Debug Mode

Run tests with verbose logging:
```bash
pytest tests/testsuites/test_e2e_supabase.py -v -s --log-cli-level=DEBUG
```

### Screenshots

All test failures automatically capture screenshots in `tests/screenshots/` for debugging.

## Best Practices

1. **Test Data Management**
   - Use separate test environment for Supabase
   - Clean up test data after tests
   - Use realistic test data

2. **Test Organization**
   - Group related tests in classes
   - Use descriptive test names
   - Add proper documentation

3. **Error Handling**
   - Test both success and failure scenarios
   - Verify proper error messages
   - Test network failure scenarios

4. **Performance Testing**
   - Monitor API response times
   - Test with realistic data volumes
   - Verify app responsiveness

## Support

For issues with the test suite:
1. Check the troubleshooting section above
2. Review test logs in `tests/logs/`
3. Check screenshots in `tests/screenshots/`
4. Verify Supabase project configuration
5. Ensure all prerequisites are met

For Supabase-specific issues:
- Check [Supabase Documentation](https://supabase.com/docs)
- Verify API keys and permissions
- Check database schema and RLS policies