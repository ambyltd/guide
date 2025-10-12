#!/bin/bash
# Script de démarrage complet - AudioGuide Côte d'Ivoire
# Lance le backend et l'application Ionic en parallèle

echo "🚀 Démarrage de l'application AudioGuide..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer Node.js"
    exit 1
fi

# Démarrer le backend
echo -e "${BLUE}📡 Démarrage du Backend API...${NC}"
cd backend-api
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances backend...${NC}"
    npm install
fi
npm run dev &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
echo -e "${YELLOW}⏳ Attente du démarrage du backend (5s)...${NC}"
sleep 5

# Démarrer l'application Ionic
echo -e "${BLUE}📱 Démarrage de l'application Ionic...${NC}"
cd ionic-app
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances Ionic...${NC}"
    npm install
fi
npm run dev &
IONIC_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Application démarrée avec succès !${NC}"
echo ""
echo "📡 Backend API: http://localhost:5000"
echo "📱 Application Ionic: http://localhost:8100"
echo ""
echo "Pour arrêter l'application, appuyez sur Ctrl+C"
echo ""

# Attendre que l'utilisateur arrête l'application
wait $BACKEND_PID $IONIC_PID
