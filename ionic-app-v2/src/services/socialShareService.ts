/**
 * 🚀 SPRINT 4: Service de Partage Social
 * 
 * Gère le partage de contenus vers les réseaux sociaux (Facebook, Twitter, WhatsApp)
 * avec Capacitor Share API et deep links.
 * 
 * Features:
 * - Partage natif iOS/Android via Capacitor Share
 * - Fallback Web Share API pour navigateurs
 * - Deep links vers attractions (/attraction/:id)
 * - Metadata Open Graph pour preview cards
 * - Tracking des partages dans userStats
 * - Templates personnalisés par plateforme
 */

import { Share } from '@capacitor/share';
import { userStatsService } from './userStatsService';
import { apiClient } from './apiClient';

// Types
export interface ShareOptions {
  title: string;
  text: string;
  url: string;
  dialogTitle?: string;
}

export interface ShareAttractionOptions {
  attractionId: string;
  attractionName: string;
  description: string;
  imageUrl?: string;
  rating?: number;
}

export interface ShareResult {
  success: boolean;
  activityType?: string; // Type de partage (com.apple.UIKit.activity.Message, etc.)
  error?: string;
}

class SocialShareService {
  private isInitialized = false;
  private baseUrl = ''; // URL de base de l'app (ex: https://audioguide-ci.com)

  /**
   * Initialiser le service avec l'URL de base
   */
  initialize(baseUrl: string = window.location.origin): void {
    this.baseUrl = baseUrl;
    this.isInitialized = true;
    console.log('[SocialShareService] Initialized with baseUrl:', this.baseUrl);
  }

  /**
   * Vérifier si le partage natif est disponible
   */
  async canShare(): Promise<boolean> {
    try {
      // Capacitor Share est toujours disponible sur mobile
      if (typeof (Share as any).canShare === 'function') {
        return await (Share as any).canShare();
      }

      // Fallback: vérifier Web Share API
      if (navigator.share) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('[SocialShareService] Error checking share capability:', error);
      return false;
    }
  }

  /**
   * Partager du contenu générique
   */
  async share(options: ShareOptions): Promise<ShareResult> {
    try {
      if (!this.isInitialized) {
        this.initialize();
      }

      console.log('[SocialShareService] Sharing:', options);

      // Tenter le partage natif Capacitor
      const result = await Share.share({
        title: options.title,
        text: options.text,
        url: options.url,
        dialogTitle: options.dialogTitle || 'Partager via',
      });

      console.log('[SocialShareService] Share result:', result);

      // Incrémenter le compteur de partages dans userStats
      await this.trackShare('generic');

      return {
        success: true,
        activityType: result.activityType,
      };
    } catch (error: any) {
      console.error('[SocialShareService] Share error:', error);

      // Si l'utilisateur a annulé, ce n'est pas une erreur
      if (error?.message?.includes('canceled') || error?.message?.includes('cancelled')) {
        return {
          success: false,
          error: 'canceled',
        };
      }

      // Tenter fallback Web Share API
      if (navigator.share) {
        try {
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url,
          });

          await this.trackShare('generic');

          return { success: true };
        } catch (webError) {
          console.error('[SocialShareService] Web Share error:', webError);
        }
      }

      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Partager une attraction avec métadonnées optimisées
   */
  async shareAttraction(options: ShareAttractionOptions): Promise<ShareResult> {
    const url = `${this.baseUrl}/attraction/${options.attractionId}`;
    
    // Générer le texte de partage
    let text = `Découvrez ${options.attractionName}`;
    if (options.rating) {
      text += ` ⭐ ${options.rating.toFixed(1)}/5`;
    }
    if (options.description) {
      // Limiter la description à 150 caractères
      const shortDesc = options.description.length > 150 
        ? options.description.substring(0, 147) + '...'
        : options.description;
      text += `\n\n${shortDesc}`;
    }
    text += `\n\n🇨🇮 Audioguide Côte d'Ivoire`;

    const result = await this.share({
      title: options.attractionName,
      text,
      url,
      dialogTitle: `Partager ${options.attractionName}`,
    });

    // Tracker le partage d'attraction
    if (result.success) {
      await this.trackShare('attraction', options.attractionId);
    }

    return result;
  }

  /**
   * Partager vers WhatsApp (deep link)
   */
  async shareToWhatsApp(text: string, url: string): Promise<void> {
    const message = encodeURIComponent(`${text}\n\n${url}`);
    const whatsappUrl = `whatsapp://send?text=${message}`;

    try {
      window.location.href = whatsappUrl;
      await this.trackShare('whatsapp');
    } catch (error) {
      console.error('[SocialShareService] WhatsApp share error:', error);
      // Fallback: ouvrir dans le navigateur
      window.open(`https://wa.me/?text=${message}`, '_blank');
    }
  }

  /**
   * Partager vers Facebook (deep link)
   */
  async shareToFacebook(url: string): Promise<void> {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

    try {
      window.open(fbUrl, '_blank', 'width=600,height=400');
      await this.trackShare('facebook');
    } catch (error) {
      console.error('[SocialShareService] Facebook share error:', error);
    }
  }

  /**
   * Partager vers Twitter (deep link)
   */
  async shareToTwitter(text: string, url: string, hashtags: string[] = []): Promise<void> {
    const params = new URLSearchParams({
      text,
      url,
      hashtags: hashtags.join(','),
    });

    const twitterUrl = `https://twitter.com/intent/tweet?${params.toString()}`;

    try {
      window.open(twitterUrl, '_blank', 'width=600,height=400');
      await this.trackShare('twitter');
    } catch (error) {
      console.error('[SocialShareService] Twitter share error:', error);
    }
  }

  /**
   * Copier le lien dans le presse-papiers
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        console.log('[SocialShareService] Link copied to clipboard');
        await this.trackShare('clipboard');
        return true;
      } else {
        // Fallback pour anciens navigateurs
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (success) {
          await this.trackShare('clipboard');
        }
        
        return success;
      }
    } catch (error) {
      console.error('[SocialShareService] Clipboard error:', error);
      return false;
    }
  }

  /**
   * Tracker un partage dans les statistiques utilisateur
   */
  private async trackShare(platform: string, contentId?: string): Promise<void> {
    try {
      // Incrémenter le compteur général de partages dans userStats
      await userStatsService.incrementStat('shareCount' as any, 1);

      // Appeler l'endpoint backend pour tracker le partage détaillé
      await apiClient.post('/api/analytics/share', {
        platform,
        contentId,
        timestamp: new Date().toISOString(),
      });

      console.log(`[SocialShareService] Share tracked: ${platform}`, contentId);
    } catch (error) {
      console.error('[SocialShareService] Error tracking share:', error);
      // Ne pas bloquer le partage si le tracking échoue
    }
  }

  /**
   * Générer les métadonnées Open Graph pour SEO/preview cards
   */
  generateOpenGraphMeta(options: ShareAttractionOptions): string {
    const url = `${this.baseUrl}/attraction/${options.attractionId}`;
    
    return `
      <meta property="og:title" content="${options.attractionName}" />
      <meta property="og:description" content="${options.description}" />
      <meta property="og:url" content="${url}" />
      <meta property="og:type" content="website" />
      ${options.imageUrl ? `<meta property="og:image" content="${options.imageUrl}" />` : ''}
      <meta property="og:site_name" content="Audioguide Côte d'Ivoire" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${options.attractionName}" />
      <meta name="twitter:description" content="${options.description}" />
      ${options.imageUrl ? `<meta name="twitter:image" content="${options.imageUrl}" />` : ''}
    `.trim();
  }
}

// Export singleton
export const socialShareService = new SocialShareService();
