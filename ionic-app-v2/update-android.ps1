# ========================================
# SCRIPT: Mise a Jour Version Android
# ========================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MISE A JOUR VERSION ANDROID" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$startTime = Get-Date

# Etape 1: Build Vite
Write-Host "`n[1/2] Build Vite production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERREUR Build!" -ForegroundColor Red
    exit 1
}
Write-Host "OK Build termine" -ForegroundColor Green

# Etape 2: Sync Capacitor
Write-Host "`n[2/2] Sync Capacitor..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERREUR Sync!" -ForegroundColor Red
    exit 1
}
Write-Host "OK Sync termine" -ForegroundColor Green

# Duree
$duration = (Get-Date) - $startTime
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  TERMINE en $([int]$duration.TotalSeconds)s" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan

Write-Host "`nPROCHAINES ETAPES (Android Studio):" -ForegroundColor Yellow
Write-Host "  1. Ouvrir Android Studio" -ForegroundColor White
Write-Host "  2. Build > Clean Project" -ForegroundColor White
Write-Host "  3. Build > Rebuild Project" -ForegroundColor White
Write-Host "  4. Run app sur device" -ForegroundColor White

$open = Read-Host "`nOuvrir Android Studio? (o/n)"
if ($open -eq "o") {
    cmd /c "open-android-studio.bat"
}
