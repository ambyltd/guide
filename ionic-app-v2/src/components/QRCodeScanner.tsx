/**
 * QRCodeScanner Component
 * Scanner de QR Code pour déclencher la lecture audio d'une attraction
 * Utilise @capacitor-community/barcode-scanner
 */

import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  useIonToast,
} from '@ionic/react';
import { qrCodeOutline, closeOutline, flashlightOutline } from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { useHistory } from 'react-router-dom';
import './QRCodeScanner.css';

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ isOpen, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [presentToast] = useIonToast();
  const history = useHistory();

  /**
   * Demander les permissions caméra
   */
  const checkPermissions = async (): Promise<boolean> => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });

      if (status.granted) {
        return true;
      }

      if (status.denied) {
        presentToast({
          message: 'Permission caméra refusée. Activez-la dans les paramètres.',
          duration: 3000,
          color: 'danger',
          position: 'top',
        });
        return false;
      }

      // Demander la permission
      const request = await BarcodeScanner.checkPermission({ force: true });
      return request.granted;
    } catch (error) {
      console.error('[QRCodeScanner] Erreur permissions:', error);
      return false;
    }
  };

  /**
   * Démarrer le scan
   */
  const startScan = async () => {
    try {
      // Vérifier les permissions
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        return;
      }

      setScanning(true);

      // Cacher le body pour la caméra en arrière-plan
      document.body.classList.add('qr-scanner-active');

      // Démarrer le scan
      const result = await BarcodeScanner.startScan();

      if (result.hasContent) {
        console.log('[QRCodeScanner] QR scanné:', result.content);
        await handleScannedCode(result.content);
      }
    } catch (error) {
      console.error('[QRCodeScanner] Erreur scan:', error);
      presentToast({
        message: 'Erreur lors du scan du QR code',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
    } finally {
      stopScan();
    }
  };

  /**
   * Arrêter le scan
   */
  const stopScan = () => {
    BarcodeScanner.stopScan();
    document.body.classList.remove('qr-scanner-active');
    setScanning(false);
  };

  /**
   * Toggle lampe torche
   */
  const toggleTorch = async () => {
    try {
      await BarcodeScanner.toggleTorch();
      setTorchOn(!torchOn);
    } catch (error) {
      console.error('[QRCodeScanner] Erreur torch:', error);
    }
  };

  /**
   * Traiter le code QR scanné
   */
  const handleScannedCode = async (content: string) => {
    try {
      // Format attendu: audioguide://attraction/{attractionId}?lang=fr&autoplay=true
      const qrRegex = /^audioguide:\/\/attraction\/([a-f0-9]{24})(\?.*)?$/i;
      const match = content.match(qrRegex);

      if (!match) {
        presentToast({
          message: 'QR Code invalide. Scannez un QR code d\'attraction.',
          duration: 3000,
          color: 'warning',
          position: 'top',
        });
        return;
      }

      const attractionId = match[1];

      // Parser les query params
      const urlParams = new URLSearchParams(match[2] || '');
      const lang = urlParams.get('lang') || 'fr';
      const autoplay = urlParams.get('autoplay') === 'true';

      console.log('[QRCodeScanner] Navigation:', { attractionId, lang, autoplay });

      // Fermer le modal
      onClose();

      // Naviguer vers la page AttractionDetail avec autoplay
      history.push({
        pathname: `/attraction/${attractionId}`,
        search: `?autoplay=${autoplay}&language=${lang}`,
      });

      // Toast de succès
      presentToast({
        message: '🎵 Ouverture de l\'attraction...',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
    } catch (error) {
      console.error('[QRCodeScanner] Erreur traitement QR:', error);
      presentToast({
        message: 'Erreur lors du traitement du QR code',
        duration: 2000,
        color: 'danger',
        position: 'top',
      });
    }
  };

  /**
   * Fermer le modal
   */
  const handleClose = () => {
    if (scanning) {
      stopScan();
    }
    onClose();
  };

  /**
   * Gérer l'ouverture du modal
   */
  const handleDidPresent = () => {
    if (isOpen) {
      startScan();
    }
  };

  /**
   * Gérer la fermeture du modal
   */
  const handleDidDismiss = () => {
    if (scanning) {
      stopScan();
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidPresent={handleDidPresent}
      onDidDismiss={handleDidDismiss}
      className="qr-scanner-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scanner QR Code</IonTitle>
          <IonButton slot="end" fill="clear" onClick={handleClose}>
            <IonIcon icon={closeOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="qr-scanner-content">
        {!scanning ? (
          <div className="qr-scanner-instructions">
            <IonCard>
              <IonCardContent>
                <div className="instructions-icon">
                  <IonIcon icon={qrCodeOutline} className="qr-icon-large" />
                </div>

                <IonText>
                  <h2>Scanner un QR Code</h2>
                  <p>
                    Scannez le QR code affiché à l'entrée de l'attraction pour démarrer
                    automatiquement le guide audio.
                  </p>
                </IonText>

                <IonButton expand="block" size="large" onClick={startScan}>
                  <IonIcon slot="start" icon={qrCodeOutline} />
                  Démarrer le scan
                </IonButton>

                <div className="instructions-tips">
                  <IonText color="medium">
                    <p>
                      <strong>Astuce :</strong> Assurez-vous que le QR code est bien éclairé
                      et centré dans la caméra.
                    </p>
                  </IonText>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        ) : (
          <div className="qr-scanner-active-view">
            <div className="scanner-overlay">
              <div className="scanner-frame"></div>

              <div className="scanner-instructions">
                <IonText color="light">
                  <p>Positionnez le QR code dans le cadre</p>
                </IonText>
              </div>

              <div className="scanner-controls">
                <IonButton
                  fill="solid"
                  color={torchOn ? "warning" : "light"}
                  shape="round"
                  onClick={toggleTorch}
                >
                  <IonIcon
                    icon={flashlightOutline}
                    slot="icon-only"
                  />
                </IonButton>
              </div>

              <div className="scanner-loading">
                <IonSpinner name="crescent" color="light" />
                <IonText color="light">
                  <p>Scan en cours...</p>
                </IonText>
              </div>
            </div>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default QRCodeScanner;
