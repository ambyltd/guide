# Script de démarrage complet - AudioGuide Côte d'Ivoire (PowerShell)
# Lance le backend et l'application Ionic en parallèle

Write-Host "🚀 Démarrage de l'application AudioGuide..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si npm est installé
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm n'est pas installé. Veuillez installer Node.js" -ForegroundColor Red
    exit 1
}

# Fonction pour démarrer le backend
function Start-Backend {
    Write-Host "📡 Démarrage du Backend API..." -ForegroundColor Blue
    Set-Location backend-api
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installation des dépendances backend..." -ForegroundColor Yellow
        npm install
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Set-Location ..
}

# Fonction pour démarrer l'application Ionic
function Start-Ionic {
    Write-Host "📱 Démarrage de l'application Ionic..." -ForegroundColor Blue
    Set-Location ionic-app
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installation des dépendances Ionic..." -ForegroundColor Yellow
        npm install
    }
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
    Set-Location ..
}

# Démarrer le backend
Start-Backend

# Attendre 5 secondes
Write-Host "⏳ Attente du démarrage du backend (5s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Démarrer Ionic
Start-Ionic

Write-Host ""
Write-Host "✅ Application démarrée avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "📡 Backend API: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📱 Application Ionic: http://localhost:8100" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les serveurs s'exécutent dans des fenêtres PowerShell séparées." -ForegroundColor Yellow
Write-Host "Pour arrêter l'application, fermez ces fenêtres." -ForegroundColor Yellow
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenêtre..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
