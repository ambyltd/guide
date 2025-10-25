"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
try {
    // Vérifier si Firebase est déjà initialisé
    if (!firebase_admin_1.default.apps.length) {
        const serviceAccountPath = path_1.default.join(__dirname, 'firebase-service-account.json');
        // Vérifier que le fichier existe
        if (!fs_1.default.existsSync(serviceAccountPath)) {
            console.warn('⚠️ Firebase service account file not found at:', serviceAccountPath);
            console.warn('⚠️ Server will continue without Firebase authentication.');
        }
        else {
            firebase_admin_1.default.initializeApp({
                credential: firebase_admin_1.default.credential.cert(serviceAccountPath)
            });
            console.log('✅ Firebase Admin SDK Initialized successfully.');
        }
    }
    else {
        console.log('✅ Firebase Admin SDK already initialized.');
    }
}
catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error);
    console.warn('⚠️ Server will continue in development mode without Firebase auth.');
}
exports.default = firebase_admin_1.default;
