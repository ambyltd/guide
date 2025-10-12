# Script pour autoriser le port 5000 dans le firewall Windows
# À exécuter en tant qu'Administrateur

Write-Host "🔐 Configuration du Firewall Windows pour le Backend API..." -ForegroundColor Cyan

# Vérifier si la règle existe déjà
$existingRule = Get-NetFirewallRule -DisplayName "Node.js Backend API Port 5000" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "✅ La règle firewall existe déjà" -ForegroundColor Green
} else {
    # Ajouter la règle
    New-NetFirewallRule -DisplayName "Node.js Backend API Port 5000" `
                        -Direction Inbound `
                        -Protocol TCP `
                        -LocalPort 5000 `
                        -Action Allow `
                        -Profile Any
    
    Write-Host "✅ Règle firewall ajoutée avec succès !" -ForegroundColor Green
}

Write-Host "`n📱 Ton téléphone Android peut maintenant accéder à:" -ForegroundColor Yellow
Write-Host "   http://192.168.1.133:5000/api" -ForegroundColor White

Write-Host "`n🧪 Test rapide depuis ton téléphone:" -ForegroundColor Cyan
Write-Host "   Ouvre un navigateur sur ton téléphone" -ForegroundColor White
Write-Host "   Va sur: http://192.168.1.133:5000/api/health" -ForegroundColor White
Write-Host "   Tu devrais voir: {""status"":""ok"",""message"":""API is running""}" -ForegroundColor Green

Write-Host "`n🚀 Relance l'app AudioGuide sur ton téléphone !" -ForegroundColor Magenta

Read-Host -Prompt "`nAppuie sur Entrée pour fermer"
