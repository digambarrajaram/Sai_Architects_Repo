# Appium Test Setup & Execution Guide

Complete setup instructions for Appium testing on React Native Android app.

---

## Prerequisites

Before running tests, ensure you have:

1. **Android device** connected via USB with USB debugging enabled
2. **APK built** and placed at `android/app/build/outputs/apk/debug/app-debug.apk`
3. **Appium server** running
4. **Python virtual environment** activated

---

## Step 1: Install Dependencies

```bash
# Navigate to project
cd d:/Sai_App

# Create virtual environment (if not exists)
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install Python dependencies
pip install -r tests/requirements.txt
```

---

## Step 2: Install Appium & Drivers

```bash
# Install Appium 2.x globally
npm install -g appium

# Install UiAutomator2 driver for Android
appium driver install uiautomator2

# Verify installation
appium driver list
```

Expected output:
```
✔ Available UiAutomator2 drivers
└── uiautomator2@latest [installed]
```

---

## Step 3: Verify Device Connection

```bash
# List connected devices
adb devices

# Expected output:
# List of devices attached
# ABC123XYZ    device
```

If no device appears:
1. Enable USB debugging on your Android device
2. Authorize the computer when prompted
3. Try a different USB cable/port

---

## Step 4: Build the APK

```bash
# Option A: Using EAS Build (Recommended)
npm install -g eas-cli
eas login
eas build --platform android --profile preview

# Option B: Local Development Build
cd android
./gradlew assembleDebug

# APK will be at: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Step 5: Start Appium Server

**IMPORTANT: Run in a SEPARATE terminal**

```bash
# Start Appium server with logging
appium --log-level info --log d:/Sai_App/tests/logs/appium_server.log
```

Or for console output only:
```bash
appium
```

Appium server URL: `http://localhost:4723`

---

## Step 6: Run Tests

```bash
# Navigate to project
cd d:/Sai_App

# Activate virtual environment
venv\Scripts\activate

# Run all tests
python -m pytest tests/ -v

# Run specific test file
python -m pytest tests/testsuites/test_login_flow.py -v

# Run single test
python -m pytest tests/testsuites/test_login_flow.py::TestLoginFlow::test_successful_login -v

# Run tests with screenshot on failure
python -m pytest tests/ -v --html=tests/reports/report.html

# Run smoke tests only
python -m pytest tests/ -v -m smoke
```

---

## Step 7: View Live Test Execution (Optional)

For screen mirroring during tests:

```bash
# Start scrcpy (shows device screen on computer)
scrcpy

# scrcpy options for better visibility
scrcpy --max-size 1920 --bit-rate 8M --show-touches on
```

---

## Quick Reference Commands

| Action | Command |
|--------|---------|
| Activate environment | `venv\Scripts\activate` |
| Start Appium | `appium` |
| Run all tests | `python -m pytest tests/ -v` |
| Run with report | `python -m pytest tests/ --html=reports/report.html` |
| View live screen | `scrcpy` |
| Check devices | `adb devices` |
| Check Appium status | `curl http://localhost:4723/status` |

---

## Troubleshooting

### Appium server won't start
```bash
# Kill any existing Appium processes
taskkill /F /IM node.exe

# Restart Appium
appium
```

### Device not found
```bash
# Restart ADB server
adb kill-server
adb start-server
adb devices
```

### Test fails immediately
1. Check if APK exists at correct path
2. Verify app package in capabilities.py matches app.json
3. Ensure noReset=True (prevents app reinstall each time)

### Screenshot not captured
```bash
# Create screenshots directory manually
mkdir tests/screenshots
mkdir tests/reports
mkdir tests/logs
```

---

## Test Results

- **Screenshots**: `tests/screenshots/` (auto-captured on failure)
- **HTML Report**: `tests/reports/report.html`
- **Appium Logs**: `tests/logs/appium_server.log`
- **Test Logs**: `tests/logs/appium_tests.log`

---

## Adding New Test Cases

1. Create new page object in `tests/pages/` (if new screen)
2. Add test class in `tests/testsuites/`
3. Import page objects and use driver fixture

Example test:
```python
def test_my_new_feature(self, driver):
    """Description of test"""
    from tests.pages.login_page import LoginPage
    login_page = LoginPage(driver)
    # Test steps...
```
