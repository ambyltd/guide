# Script de correction des versions pour compatibilite Ionic 8 + React 18 + React Router 6

Write-Host "Correction des versions incompatibles..." -ForegroundColor Yellow

# 1. Downgrade React 19 vers React 18
Write-Host "`nEtape 1: Installation de React 18.3.1 (compatible Ionic 8)" -ForegroundColor Cyan
npm install react@18.3.1 react-dom@18.3.1

# 2. Upgrade React Router 5 vers React Router 6
Write-Host "`nEtape 2: Installation de React Router 6.28.0 (compatible @ionic/react-router 8)" -ForegroundColor Cyan
npm install react-router@6.28.0 react-router-dom@6.28.0

# 3. Downgrade Ionic 8.5 vers Ionic 8.3 (LTS stable)
Write-Host "`nEtape 3: Installation de Ionic 8.3.0 (version LTS stable)" -ForegroundColor Cyan
npm install @ionic/react@8.3.0 @ionic/react-router@8.3.0 @ionic/core@8.3.0

# 4. Mise a jour des types TypeScript
Write-Host "`nEtape 4: Installation des types TypeScript corrects" -ForegroundColor Cyan
npm install --save-dev @types/react@18.3.3 @types/react-dom@18.3.0

# 5. Verification finale
Write-Host "`nVerification des versions installees:" -ForegroundColor Green
npm list react react-dom react-router react-router-dom @ionic/react @ionic/react-router

Write-Host "`nCorrection terminee! Versions compatibles installees." -ForegroundColor Green
Write-Host "Prochaine etape: npm run build" -ForegroundColor Yellow
