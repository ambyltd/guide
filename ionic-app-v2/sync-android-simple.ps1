# ========================================
# SCRIPT: Sync Android Simple (SANS Gradle)
# ========================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SYNC ANDROID SIMPLE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$startTime = Get-Date

# Etape 1: Build Vite
Write-Host "`n[1/3] Build Vite production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERREUR Build Vite!" -ForegroundColor Red
    exit 1
}
Write-Host "OK Build Vite termine" -ForegroundColor Green

# Etape 2: Copier fichiers vers Android (SANS Gradle)
Write-Host "`n[2/3] Copie vers android/app/src/main/assets/public..." -ForegroundColor Yellow

# Supprimer ancien assets
if (Test-Path "android\app\src\main\assets\public") {
    Remove-Item -Recurse -Force "android\app\src\main\assets\public"
    Write-Host "Ancien assets supprime" -ForegroundColor Gray
}

# Copier nouveau dist
Copy-Item -Path "dist\*" -Destination "android\app\src\main\assets\public\" -Recurse -Force
if (Test-Path "android\app\src\main\assets\public\index.html") {
    Write-Host "OK Fichiers copies" -ForegroundColor Green
} else {
    Write-Host "`nERREUR Copie fichiers!" -ForegroundColor Red
    exit 1
}

# Etape 3: Copier capacitor.config.json
Write-Host "`n[3/3] Copie capacitor.config.json..." -ForegroundColor Yellow
npx cap copy android --no-build 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Config copiee" -ForegroundColor Green
} else {
    Write-Host "WARNING Config non copiee (non bloquant)" -ForegroundColor Yellow
}

# Duree
$duration = (Get-Date) - $startTime
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  TERMINE en $([int]$duration.TotalSeconds)s" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`nFICHIERS SYNCHRONISES:" -ForegroundColor Green
Write-Host "  dist/ --> android/app/src/main/assets/public/" -ForegroundColor White

Write-Host "`nPROCHAINES ETAPES (Android Studio):" -ForegroundColor Yellow
Write-Host "  1. Ouvrir Android Studio" -ForegroundColor White
Write-Host "  2. Build > Clean Project" -ForegroundColor White
Write-Host "  3. Build > Rebuild Project" -ForegroundColor White
Write-Host "  4. Run app sur device" -ForegroundColor White
Write-Host "`n  NOTE: Android Studio utilisera son propre JDK" -ForegroundColor Cyan

$open = Read-Host "`nOuvrir Android Studio? (o/n)"
if ($open -eq "o") {
    if (Test-Path "open-android-studio.bat") {
        cmd /c "open-android-studio.bat"
    } else {
        Write-Host "Fichier open-android-studio.bat non trouve" -ForegroundColor Yellow
    }
}
