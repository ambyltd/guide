/**
 * Script pour créer un utilisateur administrateur dans Firebase Auth
 * 
 * Usage: npm run create-admin
 * ou: ts-node scripts/create-admin-user.ts
 */

import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialiser Firebase Admin SDK
if (!admin.apps.length) {
  // Charger le service account depuis le fichier JSON
  const serviceAccountPath = path.resolve(__dirname, '../src/config/firebase-service-account.json');
  const serviceAccount = require(serviceAccountPath);
  
  if (!serviceAccount.project_id) {
    console.error('❌ Erreur: firebase-service-account.json invalide');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
  });
  console.log('✅ Firebase Admin SDK initialisé');
}

const auth = admin.auth();

interface AdminUserData {
  email: string;
  password: string;
  displayName: string;
  role: string;
}

async function createAdminUser(userData: AdminUserData) {
  try {
    console.log(`\n🔄 Création de l'utilisateur: ${userData.email}...`);

    // Vérifier si l'utilisateur existe déjà
    try {
      const existingUser = await auth.getUserByEmail(userData.email);
      console.log(`ℹ️  Utilisateur existe déjà (UID: ${existingUser.uid})`);
      
      // Mettre à jour le rôle admin via custom claims
      await auth.setCustomUserClaims(existingUser.uid, { role: userData.role });
      console.log(`✅ Custom claim 'role: ${userData.role}' ajouté à l'utilisateur existant`);
      
      return existingUser;
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email: userData.email,
      password: userData.password,
      displayName: userData.displayName,
      emailVerified: true
    });

    console.log(`✅ Utilisateur créé dans Firebase Auth`);
    console.log(`   UID: ${userRecord.uid}`);

    // Ajouter le custom claim pour le rôle admin
    await auth.setCustomUserClaims(userRecord.uid, { role: userData.role });
    console.log(`✅ Custom claim 'role: ${userData.role}' ajouté`);

    console.log(`\n✨ Utilisateur administrateur créé avec succès!\n`);
    console.log(`📧 Email: ${userData.email}`);
    console.log(`🔑 Mot de passe: ${userData.password}`);
    console.log(`👤 Rôle: ${userData.role}\n`);

    return userRecord;
  } catch (error: any) {
    console.error('❌ Erreur lors de la création:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // Créer plusieurs utilisateurs admin/test
    const users: AdminUserData[] = [
      {
        email: 'admin@ambyl.fr',
        password: 'Admin123!',
        displayName: 'Administrateur Principal',
        role: 'admin'
      },
      {
        email: 'ambyltd@gmail.com',
        password: 'Ambyl2024!',
        displayName: 'Ambyl Admin',
        role: 'admin'
      }
    ];

    console.log('═══════════════════════════════════════════════════');
    console.log('   Création des utilisateurs administrateurs');
    console.log('═══════════════════════════════════════════════════');

    for (const userData of users) {
      await createAdminUser(userData);
    }

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Tous les utilisateurs ont été créés avec succès!');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('🔐 Vous pouvez maintenant vous connecter avec:');
    users.forEach(user => {
      console.log(`   • ${user.email} / ${user.password}`);
    });

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();
