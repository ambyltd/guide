/**
 * Service de Notifications Locales
 * Gère les notifications de proximité et autres alertes
 */

import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';

export interface NotificationConfig {
  title: string;
  body: string;
  id?: number;
  schedule?: {
    at: Date;
  };
  sound?: string;
  attachments?: Array<{
    id: string;
    url: string;
  }>;
  actionTypeId?: string;
  extra?: Record<string, unknown>;
}

class NotificationService {
  private notificationId = 1;
  private hasPermission = false;

  /**
   * Initialiser le service et demander permissions
   */
  async initialize(): Promise<boolean> {
    try {
      // Vérifier les permissions existantes
      const result = await LocalNotifications.checkPermissions();
      
      if (result.display === 'granted') {
        this.hasPermission = true;
        console.log('✅ Permissions notifications déjà accordées');
        return true;
      }

      // Demander les permissions
      const permission = await LocalNotifications.requestPermissions();
      this.hasPermission = permission.display === 'granted';
      
      if (this.hasPermission) {
        console.log('✅ Permissions notifications accordées');
        
        // Écouter les clics sur notifications
        await this.setupNotificationListeners();
      } else {
        console.warn('⚠️ Permissions notifications refusées');
      }

      return this.hasPermission;
    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
      return false;
    }
  }

  /**
   * Configurer les listeners pour les notifications
   */
  private async setupNotificationListeners(): Promise<void> {
    // Notification reçue (affichée)
    await LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('📬 Notification reçue:', notification);
    });

    // Notification cliquée
    await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('👆 Notification cliquée:', notification);
      
      // Gérer l'action selon le type
      if (notification.notification.extra) {
        this.handleNotificationAction(notification.notification.extra);
      }
    });
  }

  /**
   * Gérer l'action suite au clic sur notification
   */
  private handleNotificationAction(extra: Record<string, unknown>): void {
    const { type, attractionId, audioGuideId } = extra;

    switch (type) {
      case 'proximity':
        // Rediriger vers la page de l'attraction
        if (attractionId) {
          window.location.href = `/tabs/attraction/${attractionId}`;
        }
        break;
      
      case 'download_complete':
        // Ouvrir le lecteur audio
        if (audioGuideId) {
          console.log('Téléchargement terminé pour audio:', audioGuideId);
        }
        break;
      
      default:
        console.log('Action notification non gérée:', type);
    }
  }

  /**
   * Afficher une notification immédiate
   */
  async showNotification(config: NotificationConfig): Promise<void> {
    if (!this.hasPermission) {
      console.warn('⚠️ Pas de permission pour afficher notification');
      return;
    }

    try {
      const id = config.id || this.notificationId++;
      
      const notification: LocalNotificationSchema = {
        title: config.title,
        body: config.body,
        id,
        ...(config.sound && { sound: config.sound }),
        ...(config.attachments && { attachments: config.attachments }),
        ...(config.actionTypeId && { actionTypeId: config.actionTypeId }),
        ...(config.extra && { extra: config.extra }),
      };

      // Planifier notification immédiate
      if (config.schedule) {
        notification.schedule = config.schedule;
      }

      await LocalNotifications.schedule({
        notifications: [notification],
      });

      console.log('✅ Notification programmée:', notification.title);
    } catch (error) {
      console.error('❌ Erreur affichage notification:', error);
    }
  }

  /**
   * Notification de proximité d'une attraction
   */
  async notifyProximity(attractionName: string, attractionId: string, distance: number): Promise<void> {
    const distanceText = distance < 1000 
      ? `${Math.round(distance)}m` 
      : `${(distance / 1000).toFixed(1)}km`;

    await this.showNotification({
      title: '📍 Attraction à proximité',
      body: `${attractionName} est à ${distanceText}. Découvrir maintenant ?`,
      sound: 'default',
      extra: {
        type: 'proximity',
        attractionId,
        distance,
      },
    });
  }

  /**
   * Notification d'entrée dans une zone géographique
   */
  async notifyGeofenceEnter(attractionName: string, attractionId: string): Promise<void> {
    await this.showNotification({
      title: '🎯 Vous êtes arrivé !',
      body: `Bienvenue à ${attractionName}. Lancer l'audioguide ?`,
      sound: 'default',
      extra: {
        type: 'proximity',
        attractionId,
        event: 'enter',
      },
    });
  }

  /**
   * Notification de sortie d'une zone géographique
   */
  async notifyGeofenceExit(attractionName: string, attractionId: string): Promise<void> {
    await this.showNotification({
      title: '👋 Au revoir !',
      body: `Vous quittez ${attractionName}. Merci de votre visite !`,
      sound: 'default',
      extra: {
        type: 'proximity',
        attractionId,
        event: 'exit',
      },
    });
  }

  /**
   * Notification de téléchargement terminé
   */
  async notifyDownloadComplete(title: string, audioGuideId: string): Promise<void> {
    await this.showNotification({
      title: '⬇️ Téléchargement terminé',
      body: `${title} est maintenant disponible hors ligne`,
      sound: 'default',
      extra: {
        type: 'download_complete',
        audioGuideId,
      },
    });
  }

  /**
   * Notification de synchronisation terminée
   */
  async notifySyncComplete(itemCount: number): Promise<void> {
    await this.showNotification({
      title: '🔄 Synchronisation réussie',
      body: `${itemCount} élément(s) synchronisé(s) avec le serveur`,
      sound: 'default',
      extra: {
        type: 'sync_complete',
      },
    });
  }

  /**
   * Annuler une notification programmée
   */
  async cancelNotification(id: number): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      console.log('✅ Notification annulée:', id);
    } catch (error) {
      console.error('❌ Erreur annulation notification:', error);
    }
  }

  /**
   * Annuler toutes les notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [] });
      console.log('✅ Toutes les notifications annulées');
    } catch (error) {
      console.error('❌ Erreur annulation notifications:', error);
    }
  }

  /**
   * Obtenir les notifications en attente
   */
  async getPendingNotifications(): Promise<{ notifications: LocalNotificationSchema[] }> {
    return await LocalNotifications.getPending();
  }
}

// Export singleton
export const notificationService = new NotificationService();
export default notificationService;
