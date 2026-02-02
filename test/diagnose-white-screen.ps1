Write-Host "========================================="
Write-Host " Expo / React Native White Screen Checker "
Write-Host "========================================="

# Always resolve PROJECT ROOT (not test folder)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $root

Write-Host "`nProject root detected as:"
Write-Host "→ $root"

# 1️⃣ Expo Router conflict
Write-Host "`n[1] Checking Expo Router conflict..."
if (Test-Path "$root\src\app") {
    Write-Host "❌ FOUND src/app → Expo Router WILL hijack app"
} else {
    Write-Host "✅ No Expo Router folder"
}

# 2️⃣ App entry file
Write-Host "`n[2] Checking App.tsx..."
if (Test-Path "$root\App.tsx") {
    Write-Host "✅ App.tsx found in root"
} else {
    Write-Host "❌ App.tsx NOT FOUND in root"
}

# 3️⃣ index.js
Write-Host "`n[3] Checking index.js..."
if (Test-Path "$root\index.js") {
    Write-Host "✅ index.js exists (GOOD)"
} else {
    Write-Host "❌ index.js MISSING → WHITE SCREEN GUARANTEED"
}

# 4️⃣ package.json main / expo entry
Write-Host "`n[4] Checking package.json..."
$pkg = Get-Content "$root\package.json" | ConvertFrom-Json
if ($pkg.expo.entryPoint) {
    Write-Host "✅ Expo entryPoint → $($pkg.expo.entryPoint)"
} else {
    Write-Host "⚠️ No expo.entryPoint set"
}

# 5️⃣ Metro
Write-Host "`n[5] Checking Metro (8081)..."
try {
    Invoke-WebRequest "http://localhost:8081" -TimeoutSec 5 | Out-Null
    Write-Host "✅ Metro responding"
} catch {
    Write-Host "❌ Metro NOT running"
}

Write-Host "`nDiagnosis complete."
