# Android Build Script for Sai_App
# Sets Java 17 environment and builds the app

$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "C:\Users\Digambar Rajaram\AppData\Local\Android\Sdk"
$env:PATH = "C:\Program Files\Java\jdk-17\bin;$env:PATH"

Write-Host "Using Java version:" -ForegroundColor Cyan
java -version

Write-Host "`nBuilding Android app..." -ForegroundColor Green
npx expo run:android
