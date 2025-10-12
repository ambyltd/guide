# Script PowerShell pour autoriser le port 5000 dans Windows Firewall
# Permet aux devices Android sur le même réseau WiFi d'accéder au backend

Write-Host "🔧 Configuration du Firewall Windows pour le Backend API (Port 5000)" -ForegroundColor Cyan
Write-Host ""

# Vérifier si exécuté en tant qu'Administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERREUR : Ce script doit être exécuté en tant qu'Administrateur" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour exécuter en tant qu'Administrateur :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell" -ForegroundColor Yellow
    Write-Host "2. Sélectionner 'Exécuter en tant qu'administrateur'" -ForegroundColor Yellow
    Write-Host "3. Naviguer vers ce dossier : cd C:\Users\jpama\Desktop\i\audioguide\ionic-app-v2" -ForegroundColor Yellow
    Write-Host "4. Exécuter : .\allow-port-5000.ps1" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ Exécution en tant qu'Administrateur confirmée" -ForegroundColor Green
Write-Host ""

# Supprimer la règle existante si elle existe
Write-Host "🔍 Vérification de règles existantes..." -ForegroundColor Cyan
$existingRule = Get-NetFirewallRule -DisplayName "Backend API Port 5000" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "⚠️  Règle existante trouvée, suppression..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "Backend API Port 5000"
    Write-Host "✅ Règle existante supprimée" -ForegroundColor Green
}

# Créer la nouvelle règle Inbound (connexions entrantes)
Write-Host ""
Write-Host "📥 Création de la règle Inbound (connexions entrantes)..." -ForegroundColor Cyan
try {
    New-NetFirewallRule `
        -DisplayName "Backend API Port 5000" `
        -Direction Inbound `
        -LocalPort 5000 `
        -Protocol TCP `
        -Action Allow `
        -Profile Any `
        -Enabled True `
        -Description "Autoriser les connexions entrantes sur le port 5000 pour le backend Audioguide CI"
    
    Write-Host "✅ Règle Inbound créée avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création de la règle Inbound : $_" -ForegroundColor Red
    exit 1
}

# Créer la règle Outbound (connexions sortantes) - optionnel mais recommandé
Write-Host ""
Write-Host "📤 Création de la règle Outbound (connexions sortantes)..." -ForegroundColor Cyan
try {
    New-NetFirewallRule `
        -DisplayName "Backend API Port 5000 Outbound" `
        -Direction Outbound `
        -LocalPort 5000 `
        -Protocol TCP `
        -Action Allow `
        -Profile Any `
        -Enabled True `
        -Description "Autoriser les connexions sortantes sur le port 5000 pour le backend Audioguide CI"
    
    Write-Host "✅ Règle Outbound créée avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création de la règle Outbound : $_" -ForegroundColor Red
    exit 1
}

# Afficher les informations réseau
Write-Host ""
Write-Host "🌐 Informations Réseau" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray

$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -like "*Wi-Fi*" -or $_.InterfaceAlias -like "*Ethernet*" } | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "📍 Adresse IP de ce PC : $ipAddress" -ForegroundColor Green
    Write-Host ""
    Write-Host "Pour tester depuis le téléphone Android :" -ForegroundColor Yellow
    Write-Host "1. Connecter le téléphone au même réseau WiFi" -ForegroundColor White
    Write-Host "2. Ouvrir Chrome sur le téléphone" -ForegroundColor White
    Write-Host "3. Aller sur : http://${ipAddress}:5000/api/health" -ForegroundColor Cyan
    Write-Host "4. Vérifier la réponse JSON : {""status"":""ok""}" -ForegroundColor White
} else {
    Write-Host "⚠️  Aucune adresse IP WiFi/Ethernet trouvée" -ForegroundColor Yellow
    Write-Host "Exécutez 'ipconfig' pour voir votre adresse IP" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
Write-Host "✅ Configuration terminée avec succès !" -ForegroundColor Green
Write-Host ""
Write-Host "Le port 5000 est maintenant accessible depuis les devices Android" -ForegroundColor Green
Write-Host "sur le même réseau WiFi." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Vérifier que le backend est running : cd ..\backend-api; npm run dev" -ForegroundColor White
Write-Host "2. Installer l'app sur Android via Android Studio" -ForegroundColor White
Write-Host "3. Tester la connectivité depuis l'app" -ForegroundColor White
Write-Host ""
