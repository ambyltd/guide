# Build Android APK Debug
Write-Host "🚀 BUILD ANDROID APK DEBUG" -ForegroundColor Cyan

# Étape 1: Build web
Write-Host "`n📦 1/4 Building web assets..." -ForegroundColor Yellow
npm run build:vite
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build web failed!" -ForegroundColor Red
    exit 1
}

# Étape 2: Sync Capacitor
Write-Host "`n🔄 2/4 Syncing Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# Étape 3: Build APK
Write-Host "`n🏗️  3/4 Building APK..." -ForegroundColor Yellow
cd android
./gradlew assembleDebug
cd ..
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ APK build failed!" -ForegroundColor Red
    exit 1
}

# Étape 4: Copier APK
Write-Host "`n📋 4/4 Copying APK..." -ForegroundColor Yellow
$apkPath = "android/app/build/outputs/apk/debug/app-debug.apk"
$destPath = "audioguide-debug.apk"
Copy-Item $apkPath $destPath -Force

# Succès
Write-Host "`n✅ BUILD SUCCESS!" -ForegroundColor Green
Write-Host "APK location: $destPath" -ForegroundColor Cyan
$size = [math]::Round((Get-Item $destPath).Length / 1MB, 2)
Write-Host "Size: $size MB" -ForegroundColor Cyan

# Afficher commande install
Write-Host "`nInstall on device:" -ForegroundColor Yellow
Write-Host "  adb install -r $destPath" -ForegroundColor White

# Demander si installer maintenant
$install = Read-Host "`nInstall on connected device now? (y/n)"
if ($install -eq 'y' -or $install -eq 'Y') {
    Write-Host "`n📱 Installing on device..." -ForegroundColor Yellow
    adb install -r $destPath
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Installation success!" -ForegroundColor Green
        Write-Host "`nLaunch app:" -ForegroundColor Yellow
        Write-Host "  adb shell am start -n io.ionic.starter/.MainActivity" -ForegroundColor White
    } else {
        Write-Host "❌ Installation failed! Check device connection." -ForegroundColor Red
    }
}
