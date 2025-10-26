# ========================================
# SCRIPT: Validation Build Android
# ========================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  VALIDATION BUILD ANDROID" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$success = $true

# Test 1: index.html existe
Write-Host "`n[1/5] Verification index.html..." -ForegroundColor Yellow
if (Test-Path "android\app\src\main\assets\public\index.html") {
    $file = Get-Item "android\app\src\main\assets\public\index.html"
    Write-Host "OK index.html present (modifie: $($file.LastWriteTime))" -ForegroundColor Green
} else {
    Write-Host "ERREUR index.html manquant!" -ForegroundColor Red
    $success = $false
}

# Test 2: MapWithGeofencing present
Write-Host "`n[2/5] Verification MapWithGeofencing..." -ForegroundColor Yellow
$result = Select-String -Path "android\app\src\main\assets\public\assets\index-*.js" -Pattern "Geofence triggered" -CaseSensitive -ErrorAction SilentlyContinue
if ($result) {
    Write-Host "OK MapWithGeofencing present dans le bundle" -ForegroundColor Green
} else {
    Write-Host "ERREUR MapWithGeofencing ABSENT du bundle!" -ForegroundColor Red
    $success = $false
}

# Test 3: Service Worker present
Write-Host "`n[3/5] Verification Service Worker..." -ForegroundColor Yellow
if (Test-Path "android\app\src\main\assets\public\sw.js") {
    Write-Host "OK sw.js present" -ForegroundColor Green
} else {
    Write-Host "WARNING sw.js manquant (non bloquant)" -ForegroundColor Yellow
}

# Test 4: Taille du bundle
Write-Host "`n[4/5] Verification taille bundle..." -ForegroundColor Yellow
$indexFiles = Get-ChildItem "android\app\src\main\assets\public\assets\index-*.js" -ErrorAction SilentlyContinue
if ($indexFiles) {
    $totalSize = ($indexFiles | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "OK Bundle total: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "ERREUR Fichiers bundle manquants!" -ForegroundColor Red
    $success = $false
}

# Test 5: Date des assets
Write-Host "`n[5/5] Verification fraicheur assets..." -ForegroundColor Yellow
$now = Get-Date
$indexFile = Get-Item "android\app\src\main\assets\public\index.html" -ErrorAction SilentlyContinue
if ($indexFile) {
    $age = ($now - $indexFile.LastWriteTime).TotalMinutes
    if ($age -lt 10) {
        Write-Host "OK Assets recents (age: $([math]::Round($age, 1)) minutes)" -ForegroundColor Green
    } else {
        Write-Host "WARNING Assets anciens (age: $([math]::Round($age, 0)) minutes)" -ForegroundColor Yellow
    }
}

# Resultat final
Write-Host "`n================================================" -ForegroundColor Cyan
if ($success) {
    Write-Host "  VALIDATION REUSSIE" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "`nPROCHAINES ETAPES:" -ForegroundColor Yellow
    Write-Host "  1. Android Studio: File > Invalidate Caches > Invalidate and Restart" -ForegroundColor White
    Write-Host "  2. Attendre redemarrage (~30s)" -ForegroundColor White
    Write-Host "  3. Build > Rebuild Project" -ForegroundColor White
    Write-Host "  4. Run app sur device" -ForegroundColor White
} else {
    Write-Host "  VALIDATION ECHOUEE" -ForegroundColor Red
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "`nREFAIRE:" -ForegroundColor Yellow
    Write-Host "  npm run build" -ForegroundColor White
    Write-Host "  puis recopier dist/ vers assets/" -ForegroundColor White
}
