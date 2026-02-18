"""
Appium Capabilities Configuration for React Native Android App

This file defines the device capabilities for connecting Appium to your
React Native Android app. These settings are optimized for:
- Real Android devices (not emulators)
- Expo/React Native apps
- Visual test execution
"""

from appium.options.common import AppiumOptions
from typing import Dict, Any


def get_android_capabilities() -> Dict[str, Any]:
    """
    Returns Appium capabilities for Android device testing.
    
    Key settings explained:
    - platformName: Always "Android" for this setup
    - automationName: "UiAutomator2" for native Android automation
    - deviceName: Device identifier (will be auto-detected by Appium)
    - app: Path to your APK file
    - noReset: true = Don't clear app data between sessions (faster)
    - fullReset: false = Don't reinstall app each time
    - autoGrantPermissions: true = Auto-accept permission dialogs
    - unicodeKeyboard: true = Enable unicode input (for text fields)
    - resetKeyboard: true = Reset keyboard after test
    """
    
    return {
        "platformName": "Android",
        "automationName": "UiAutomator2",
        "deviceName": "Android",  # Appium will auto-detect connected device
        "app": "android/app/build/outputs/apk/debug/app-debug.apk",  # Path to your APK
        "appPackage": "com.anonymous.sai_app",  # From app.json -> expo.android.package
        "appActivity": ".MainActivity",  # Expo default main activity
        "appWaitPackage": "com.anonymous.sai_app",
        
        # Reset behavior - optimized for development testing
        "noReset": True,  # Don't clear app data (faster, preserves login)
        "fullReset": False,  # Don't uninstall/reinstall app
        
        # Permission handling
        "autoGrantPermissions": True,  # Auto-accept runtime permissions
        
        # Keyboard settings for text input
        "unicodeKeyboard": True,  # Enable unicode keyboard for text fields
        "resetKeyboard": True,  # Reset keyboard to default after test
        
        # Performance optimization
        "disableWindowAnimation": True,  # Disable animations for faster tests
        
        # UiAutomator2 stability fixes (CRITICAL for preventing crashes)
        "uiautomator2ServerInstallTimeout": 60000,  # 60s timeout for server install
        "uiautomator2ServerLaunchTimeout": 60000,   # 60s timeout for server launch
        "adbExecTimeout": 60000,                    # 60s timeout for ADB operations
        
        # Wait settings - explicit waits used in code, not implicit
        "waitForIdleTimeout": 100,  # Short idle timeout
        
        # ChromeDriver (not needed for pure RN app, but useful if you have WebViews)
        "chromeDriverPort": 8000,
    }


def get_appium_options() -> AppiumOptions:
    """
    Returns AppiumOptions object with configured capabilities.
    This is the recommended way to pass capabilities to Appium 2.x
    """
    options = AppiumOptions()
    caps = get_android_capabilities()
    
    for key, value in caps.items():
        options.set_capability(key, value)
    
    return options


# =============================================================================
# APK BUILD INSTRUCTIONS
# =============================================================================
#
# To build the APK for testing:
#
# Option 1: Using EAS Build (Recommended for Expo)
# ----------------------------------------------
# 1. Install EAS CLI:
#    npm install -g eas-cli
#
# 2. Login to Expo:
#    eas login
#
# 3. Build for Android:
#    eas build --platform android --profile preview
#
# 4. Download APK from Expo dashboard or email
#
# 5. Place APK at: android/app/build/outputs/apk/debug/app-debug.apk
#
# Option 2: Local Build
# --------------------
# 1. cd android
# 2. ./gradlew assembleDebug
# 3. APK at: android/app/build/outputs/apk/debug/app-debug.apk
#
# Option 3: Development Build (with Expo Go)
# -----------------------------------------
# For testing with Expo Go, change capabilities:
# - Remove "app" capability
# - Add "bundleId": "com.anonymous.sai_app"
# - Note: Expo Go has limited automation capabilities
#
# =============================================================================
