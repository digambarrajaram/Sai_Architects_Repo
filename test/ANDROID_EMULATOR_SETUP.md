# Android Emulator Setup Guide

## Prerequisites

### 1. Install Android Studio
Download from: https://developer.android.com/studio

During installation, ensure these options are checked:
- Android SDK
- Android Virtual Device
- Performance (Intel HAXM)
- Android Debug Bridge (ADB)

### 2. Set Environment Variables

Add these to your system environment variables:
```
ANDROID_HOME = C:\Users\<YourUsername>\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT = C:\Users\<YourUsername>\AppData\Local\Android\Sdk
PATH = ...;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator
```

### 3. Create Android Virtual Device (AVD)

1. Open Android Studio
2. Click "More Actions" → "Virtual Device Manager"
3. Click "Create device"
4. Select "Pixel 6" or "Pixel 7"
5. Select "API 31" or "API 34" system image
6. Click "Finish"

## Starting the Emulator

### Option 1: Using the PowerShell Script
```powershell
cd d:\Sai_App\test
.\run-android-emulator.ps1
```

### Option 2: Using Command Line
```powershell
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd Pixel_6_API_31
```

### Option 3: From Android Studio
1. Open Android Studio
2. Click "Device Manager"
3. Click the "Play" button next to your AVD

## Verify Emulator is Running

```powershell
adb devices
```

You should see:
```
List of devices attached
emulator-5554   device
```

## Running Detox Tests

```powershell
# Build and test on Android
npm run test:e2e:android
```

## Troubleshooting

### "adb is not recognized"
- Add `%ANDROID_HOME%\platform-tools` to your PATH

### "emulator is not recognized"
- Add `%ANDROID_HOME%\emulator` to your PATH

### "KVM is not available"
- Enable virtualization in BIOS
- Or use software acceleration with: `emulator -avd Pixel_6_API_31 -no-accel`

### Emulator starts but stays at boot animation
- Wipe data in AVD Manager
- Increase RAM in AVD settings
- Use cold boot: `emulator -avd Pixel_6_API_31 -no-snapshot-load`
