#!/usr/bin/env pwsh
# Script de nettoyage complet Android + Rebuild
# Usage: .\clean-android.ps1

Write-Host ""
Write-Host "🧹 NETTOYAGE COMPLET ANDROID + REBUILD" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# 1. Nettoyage caches et builds
Write-Host "📁 Suppression des builds et caches..." -ForegroundColor Yellow

$toClean = @(
    "android\app\build",
    "android\.gradle",
    "android\build",
    "android\.idea",
    "android\app\src\main\assets",
    "dist",
    "node_modules\.cache"
)

foreach ($path in $toClean) {
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path
        Write-Host "  ✅ $path supprimé" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  $path n'existe pas" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "✨ Nettoyage terminé !" -ForegroundColor Green
Write-Host ""

# 2. Rebuild Vite
Write-Host "📦 REBUILD COMPLET..." -ForegroundColor Cyan
Write-Host "1️⃣  Build Vite (bypass TypeScript)..." -ForegroundColor Yellow
npx vite build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du build Vite" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Build Vite terminé" -ForegroundColor Green

# 3. Sync Capacitor
Write-Host ""
Write-Host "2️⃣  Sync Capacitor Android..." -ForegroundColor Yellow
npx cap sync android

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Erreur lors du sync Capacitor" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Sync Capacitor terminé" -ForegroundColor Green

# 4. Ouvrir Android Studio (optionnel)
Write-Host ""
Write-Host "3️⃣  Ouvrir Android Studio ? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🚀 Ouverture d'Android Studio..." -ForegroundColor Cyan
    & ".\open-android-studio.bat"
} else {
    Write-Host ""
    Write-Host "💡 Pour ouvrir Android Studio manuellement:" -ForegroundColor Cyan
    Write-Host "   .\open-android-studio.bat" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 REBUILD ANDROID COMPLET TERMINÉ !" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Dans Android Studio: Build > Rebuild Project" -ForegroundColor White
Write-Host "   2. Connecter device Android via USB" -ForegroundColor White
Write-Host "   3. Run > Run 'app'" -ForegroundColor White
Write-Host ""
