"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuthMiddleware = void 0;
const firebaseAdmin_1 = __importDefault(require("../config/firebaseAdmin"));
const firebaseAuthMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Non autorisé: Token manquant ou mal formé'
        });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        // Vérifier si Firebase Admin est initialisé
        if (!firebaseAdmin_1.default.apps.length) {
            console.warn('⚠️ Firebase not initialized, using development mode');
            // Mode développement : créer un utilisateur fictif admin
            const authenticatedUser = {
                uid: 'dev-user-' + Math.random().toString(36).substr(2, 9),
                email: 'dev@example.com',
                role: 'admin'
            };
            req.user = authenticatedUser;
            return next();
        }
        // 1. Vérifier le token Firebase
        const decodedToken = await firebaseAdmin_1.default.auth().verifyIdToken(idToken);
        // 2. Récupérer le profil utilisateur depuis Firestore pour obtenir le rôle
        const userRecord = await firebaseAdmin_1.default.firestore().collection('users').doc(decodedToken.uid).get();
        let userRole = 'user'; // Rôle par défaut
        if (userRecord.exists) {
            const userProfile = userRecord.data();
            userRole = userProfile?.role || 'user';
        }
        else {
            console.warn(`⚠️ User profile not found in Firestore for UID: ${decodedToken.uid}, using default role`);
        }
        // 3. Créer un objet utilisateur enrichi avec le rôle
        const authenticatedUser = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userRole
        };
        // 4. Attacher l'utilisateur enrichi à la requête
        req.user = authenticatedUser;
        next();
    }
    catch (error) {
        console.error('Erreur de vérification du token:', error);
        return res.status(403).json({
            success: false,
            message: 'Interdit: Token invalide ou expiré'
        });
    }
};
exports.firebaseAuthMiddleware = firebaseAuthMiddleware;
