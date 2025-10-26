import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Provider } from 'react-redux';
import { store } from './store';
import { homeOutline, mapOutline, playCircleOutline } from 'ionicons/icons';

/* Pages Sprint 1 - MVP */
import Home from './pages/Home';
import AttractionDetail from './pages/AttractionDetail';
import Map from './pages/Map';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import AudioGuidesPage from './pages/AudioGuides';

/* Pages d'authentification */
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

/* Pages de réservation */
import PaidReservationsPage from './pages/PaidReservationsPage';

/* Pages Sprint 4 - Statistiques Avancées */
import StatsPage from './pages/StatsPage';
import LeaderboardPage from './pages/LeaderboardPage';

/* Pages Paramètres */
import SettingsPage from './pages/SettingsPage';

/* Components */
import { GuestOnly } from './components/ProtectedRoute';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ServiceWorkerProvider } from './components/ServiceWorkerProvider';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */ // Ionic 8+ only, not available in v7

/* Theme variables */
import './theme/variables.css';
import './theme/minimal.css';

setupIonicReact();

const TabsNavigation: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/tabs/home" component={Home} />
        <Route exact path="/tabs/map" component={Map} />
        <Route exact path="/tabs/audioguides" component={AudioGuidesPage} />
        <Route exact path="/tabs/favorites" component={Favorites} />
        <Route exact path="/tabs/profile" component={Profile} />
        <Route exact path="/tabs/attraction/:id" component={AttractionDetail} />
        <Route exact path="/tabs/reservations" component={PaidReservationsPage} />
        <Route exact path="/tabs">
          <Redirect to="/tabs/home" />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom" className="tab-bar-minimal">
        <IonTabButton tab="home" href="/tabs/home">
          <IonIcon aria-hidden="true" icon={homeOutline} />
          <IonLabel>Accueil</IonLabel>
        </IonTabButton>
        <IonTabButton tab="map" href="/tabs/map">
          <IonIcon aria-hidden="true" icon={mapOutline} />
          <IonLabel>Carte</IonLabel>
        </IonTabButton>
        <IonTabButton tab="audioguides" href="/tabs/audioguides">
          <IonIcon aria-hidden="true" icon={playCircleOutline} />
          <IonLabel>Guides</IonLabel>
        </IonTabButton>
        {/* RETIRÉS: Favorites et Profile déplacés dans ProfileMenu header
        {isAuthenticated && (
          <IonTabButton tab="favorites" href="/tabs/favorites">
            <IonIcon aria-hidden="true" icon={heartOutline} />
            <IonLabel>Favoris</IonLabel>
          </IonTabButton>
        )}
        <IonTabButton tab="profile" href="/tabs/profile">
          <IonIcon aria-hidden="true" icon={personOutline} />
          <IonLabel>Profil</IonLabel>
        </IonTabButton>
        */}
      </IonTabBar>
    </IonTabs>
  );
};

const AppMinimal: React.FC = () => {
  console.log('🚀 App initialized - current path:', window.location.pathname);
  
  return (
    <Provider store={store}>
      <ServiceWorkerProvider>
        <IonApp>
          {/* Indicateur de statut offline */}
          <OfflineIndicator />
        
        <IonReactRouter>
          <IonRouterOutlet>
            {/* Redirect root to tabs */}
            <Route exact path="/">
              <Redirect to="/tabs/home" />
            </Route>

            {/* Auth routes */}
            <Route exact path="/login">
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            </Route>
            <Route exact path="/register">
              <GuestOnly>
                <RegistrationPage />
              </GuestOnly>
            </Route>
            <Route exact path="/forgot-password">
              <GuestOnly>
                <ForgotPasswordPage />
              </GuestOnly>
            </Route>

            {/* Pages hors tabs */}
            <Route exact path="/stats" component={StatsPage} />
            <Route exact path="/leaderboard" component={LeaderboardPage} />
            <Route exact path="/settings" component={SettingsPage} />

            {/* Tabs navigation - DOIT être en dernier */}
            <Route path="/tabs" component={TabsNavigation} />
          </IonRouterOutlet>
        </IonReactRouter>
      </IonApp>
    </ServiceWorkerProvider>
  </Provider>
  );
};

export default AppMinimal;
