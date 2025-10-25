# Script de redémarrage du serveur backend
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "🔄 REDÉMARRAGE DU SERVEUR BACKEND" -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""

# Étape 1: Arrêter tous les processus node
Write-Host "📍 Étape 1: Arrêt des processus Node.js..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "   Trouvé $($nodeProcesses.Count) processus Node.js" -ForegroundColor Cyan
        Stop-Process -Name node -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Aucun processus Node.js en cours" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Étape 2: Vérifier que le port 5000 est libre
Write-Host "📍 Étape 2: Vérification du port 5000..." -ForegroundColor Yellow
try {
    $portInUse = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Host "   ⚠️  Port 5000 encore utilisé, attente..." -ForegroundColor Red
        Start-Sleep -Seconds 3
    } else {
        Write-Host "   ✅ Port 5000 disponible" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✅ Port 5000 disponible" -ForegroundColor Green
}

Write-Host ""

# Étape 3: Démarrer le serveur
Write-Host "📍 Étape 3: Démarrage du serveur backend..." -ForegroundColor Yellow
Write-Host "   📂 Répertoire: backend-api" -ForegroundColor Cyan
Write-Host "   🚀 Commande: npm run dev" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot
npm run dev
