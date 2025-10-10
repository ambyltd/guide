import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

try {
  // Vérifier si Firebase est déjà initialisé
  if (!admin.apps.length) {
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(serviceAccountPath)) {
      console.warn('⚠️ Firebase service account file not found at:', serviceAccountPath);
      console.warn('⚠️ Server will continue without Firebase authentication.');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath)
      });
      
      console.log('✅ Firebase Admin SDK Initialized successfully.');
    }
  } else {
    console.log('✅ Firebase Admin SDK already initialized.');
  }

} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error);
  console.warn('⚠️ Server will continue in development mode without Firebase auth.');
}

export default admin;
