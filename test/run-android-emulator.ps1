# Android Emulator Setup Script for Windows
# Prerequisites:
# 1. Install Android Studio from https://developer.android.com/studio
# 2. Install Android SDK via Android Studio SDK Manager
# 3. Create an Android Virtual Device (AVD)

# Check if Android SDK is installed
$androidSDK = $env:ANDROID_HOME
if (-not $androidSDK) {
    $androidSDK = $env:ANDROID_SDK_ROOT
}

if (-not $androidSDK) {
    Write-Host "Android SDK not found. Please install Android Studio and set ANDROID_HOME environment variable." -ForegroundColor Red
    exit 1
}

Write-Host "Android SDK found at: $androidSDK" -ForegroundColor Green

# List available emulators
Write-Host "`nAvailable Android Virtual Devices (AVDs):" -ForegroundColor Cyan
& "$androidSDK\emulator\emulator.exe" -list-avds

# Prompt user to select an emulator
$avdName = Read-Host "Enter the AVD name to start (or press Enter for 'Pixel_6_API_31')"
if (-not $avdName) {
    $avdName = "Pixel_6_API_31"
}

Write-Host "`nStarting emulator: $avdName" -ForegroundColor Cyan

# Start the emulator in background
Start-Process -FilePath "$androidSDK\emulator\emulator.exe" -ArgumentList "-avd $avdName" -WindowStyle Minimized

Write-Host "Emulator started. Waiting for boot..." -ForegroundColor Yellow

# Wait for emulator to boot (this may take several minutes)
$bootStatus = ""
while ($bootStatus -notmatch "boot completed") {
    Start-Sleep -Seconds 10
    $bootStatus = & "$androidSDK\platform-tools\adb.exe" shell getprop sys.boot_completed 2>$null
    Write-Host "Waiting for boot... ($bootStatus)" -ForegroundColor Gray
}

Write-Host "`nEmulator is ready!" -ForegroundColor Green
Write-Host "Now you can run: npm run test:e2e:android" -ForegroundColor Cyan
