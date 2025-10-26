/**
 * QR Code Service
 * Service pour l'interaction avec les endpoints QR code du backend
 */

import { apiClient } from './apiClient';
import type { BackendAttraction, BackendAudioGuide } from '../types/backend';

export interface QRCodeGenerateResponse {
  qrCode: string; // Data URL (base64)
  attractionId: string;
  attractionName: string;
  attractionNameEn?: string;
  qrContent: string;
  format: string;
  size: number;
  generatedAt: string;
}

export interface QRCodeScanResponse {
  attraction: BackendAttraction;
  audioGuides: BackendAudioGuide[];
  defaultAudioGuide?: BackendAudioGuide;
  scanMetadata: {
    scannedAt: string;
    preferredLang: string;
    autoplay: boolean;
    totalAudioGuides: number;
  };
}

export interface QRCodeBatchResponse {
  qrCodes: {
    attractionId: string;
    attractionName: string;
    attractionNameEn?: string;
    qrCode: string;
    qrContent: string;
  }[];
  total: number;
  format: string;
  generatedAt: string;
}

class QRCodeService {
  private baseUrl = '/api/qr';

  /**
   * Générer un QR code pour une attraction
   * @param attractionId ID de l'attraction
   * @param options Options de génération (format, size, preferredLang)
   */
  async generateQRCode(
    attractionId: string,
    options: {
      format?: 'dataURL' | 'buffer' | 'svg';
      size?: number;
      preferredLang?: 'fr' | 'en';
    } = {}
  ): Promise<QRCodeGenerateResponse> {
    try {
      const { format = 'dataURL', size = 300, preferredLang = 'fr' } = options;

      const response = await apiClient.post<QRCodeGenerateResponse>(
        `${this.baseUrl}/generate/${attractionId}?format=${format}&size=${size}&preferredLang=${preferredLang}`,
        {}
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la génération du QR code');
      }
    } catch (error) {
      console.error('[QRCodeService] Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Valider et récupérer les données d'un QR code scanné
   * @param content Contenu du QR code scanné
   */
  async scanQRCode(content: string): Promise<QRCodeScanResponse> {
    try {
      const response = await apiClient.get<QRCodeScanResponse>(
        `${this.baseUrl}/scan?content=${encodeURIComponent(content)}`
      );

      if (response.success) {
        console.log('[QRCodeService] QR scanné avec succès:', response.data.scanMetadata);
        return response.data;
      } else {
        throw new Error(response.message || 'QR code invalide');
      }
    } catch (error) {
      console.error('[QRCodeService] Error scanning QR code:', error);
      throw error;
    }
  }

  /**
   * Générer tous les QR codes (batch) - Pour CMS uniquement
   * @param options Options de génération (format, size)
   */
  async batchGenerateQRCodes(
    options: {
      format?: 'dataURL' | 'svg';
      size?: number;
    } = {}
  ): Promise<QRCodeBatchResponse> {
    try {
      const { format = 'dataURL', size = 300 } = options;

      const response = await apiClient.get<QRCodeBatchResponse>(
        `${this.baseUrl}/batch-generate?format=${format}&size=${size}`
      );

      if (response.success) {
        console.log(`[QRCodeService] ${response.data.total} QR codes générés`);
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur lors de la génération batch');
      }
    } catch (error) {
      console.error('[QRCodeService] Error batch generating QR codes:', error);
      throw error;
    }
  }

  /**
   * Parser le contenu d'un QR code
   * Format: audioguide://attraction/{id}?lang={lang}&autoplay=true
   */
  parseQRContent(content: string): {
    attractionId: string;
    lang: string;
    autoplay: boolean;
  } | null {
    try {
      const qrRegex = /^audioguide:\/\/attraction\/([a-f0-9]{24})(\?.*)?$/i;
      const match = content.match(qrRegex);

      if (!match) {
        return null;
      }

      const attractionId = match[1];
      const urlParams = new URLSearchParams(match[2] || '');
      const lang = urlParams.get('lang') || 'fr';
      const autoplay = urlParams.get('autoplay') === 'true';

      return { attractionId, lang, autoplay };
    } catch (error) {
      console.error('[QRCodeService] Error parsing QR content:', error);
      return null;
    }
  }

  /**
   * Générer le contenu d'un QR code
   * @param attractionId ID de l'attraction
   * @param lang Langue préférée
   * @param autoplay Lecture automatique
   */
  generateQRContent(attractionId: string, lang: 'fr' | 'en' = 'fr', autoplay: boolean = true): string {
    return `audioguide://attraction/${attractionId}?lang=${lang}&autoplay=${autoplay}`;
  }
}

export const qrCodeService = new QRCodeService();
export default qrCodeService;
