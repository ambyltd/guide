/**
 * Service Worker Provider Component
 * 
 * Gère l'initialisation du Service Worker et le précachage automatique
 * Doit être placé en haut de l'arbre des composants (dans App.tsx)
 */

import React, { useEffect, useState } from 'react';
import { IonToast } from '@ionic/react';
import { useServiceWorker } from '../hooks/useServiceWorker';
import { serviceWorkerService } from '../services/serviceWorkerService';

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export const ServiceWorkerProvider: React.FC<ServiceWorkerProviderProps> = ({ children }) => {
  const { swStatus, updateAvailable, activateUpdate, isOnline } = useServiceWorker();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [precacheStarted, setPrecacheStarted] = useState(false);

  // Enregistrer le Service Worker au montage
  useEffect(() => {
    const initServiceWorker = async () => {
      const registered = await serviceWorkerService.register();
      
      if (registered) {
        console.log('✅ Service Worker registered successfully');
        
        // Afficher toast de confirmation
        setToastMessage('🚀 Mode offline activé !');
        setShowToast(true);
      }
    };

    initServiceWorker();
  }, []);

  // Précharger les ressources essentielles une fois le SW actif
  useEffect(() => {
    if (swStatus.active && !precacheStarted && isOnline) {
      setPrecacheStarted(true);
      
      // Délai pour laisser l'app se charger
      setTimeout(async () => {
        try {
          console.log('📦 Précachage des ressources essentielles...');
          
          // Récupérer les attractions depuis le localStorage ou l'API
          const attractionsStr = localStorage.getItem('attractionsList');
          const attractions = attractionsStr ? JSON.parse(attractionsStr) : [];
          
          if (attractions.length > 0) {
            await serviceWorkerService.precacheEssentials(attractions);
            
            setToastMessage(`✅ ${attractions.length} attractions en cache`);
            setShowToast(true);
          }
        } catch (error) {
          console.error('❌ Erreur lors du précachage:', error);
        }
      }, 3000); // 3 secondes après l'activation
    }
  }, [swStatus.active, precacheStarted, isOnline]);

  // Gérer les mises à jour disponibles
  useEffect(() => {
    if (updateAvailable) {
      setToastMessage('🔄 Mise à jour disponible ! Cliquez pour installer.');
      setShowToast(true);
    }
  }, [updateAvailable]);

  return (
    <>
      {children}
      
      {/* Toast pour les notifications Service Worker */}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={updateAvailable ? 0 : 3000} // Persistant si mise à jour
        position="bottom"
        color={updateAvailable ? 'warning' : 'success'}
        buttons={
          updateAvailable
            ? [
                {
                  text: 'Installer',
                  role: 'confirm',
                  handler: () => {
                    activateUpdate();
                    setShowToast(false);
                  },
                },
                {
                  text: 'Plus tard',
                  role: 'cancel',
                },
              ]
            : undefined
        }
      />
    </>
  );
};
