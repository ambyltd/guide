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
import { homeOutline, mapOutline, heartOutline, personOutline } from 'ionicons/icons';

/* Pages Sprint 1 - MVP */
import Home from './pages/Home';
import AttractionDetail from './pages/AttractionDetail';
import Map from './pages/Map';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';

/* Pages d'authentification */
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

/* Pages de réservation */
import PaidReservationsPage from './pages/PaidReservationsPage';

/* Pages Sprint 4 - Statistiques Avancées */
import StatsPage from './pages/StatsPage';
import LeaderboardPage from './pages/LeaderboardPage';

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
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import './theme/minimal.css';

setupIonicReact();

const AppMinimal: React.FC = () => (
  <Provider store={store}>
    <ServiceWorkerProvider>
      <IonApp>
        {/* Indicateur de statut offline */}
        <OfflineIndicator />
        
        <IonReactRouter>
        <IonRouterOutlet>
          {/* Routes d'authentification */}
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

          {/* Application principale avec navigation Sprint 1 */}
          <Route path="/tabs">
            <IonTabs>
              <IonRouterOutlet>
                {/* Tab 1: Home */}
                <Route exact path="/tabs/home">
                  <Home />
                </Route>
                
                {/* Tab 2: Carte */}
                <Route exact path="/tabs/map">
                  <Map />
                </Route>
                
                {/* Tab 3: Favoris */}
                <Route exact path="/tabs/favorites">
                  <Favorites />
                </Route>
                
                {/* Tab 4: Profile */}
                <Route exact path="/tabs/profile">
                  <Profile />
                </Route>
                
                {/* Page de détail d'attraction (accessible depuis Home ou Map) */}
                <Route exact path="/tabs/attraction/:id">
                  <AttractionDetail />
                </Route>
                
                {/* Tab Réservations (conservé de l'ancienne version) */}
                <Route exact path="/tabs/reservations">
                  <PaidReservationsPage />
                </Route>
                
                {/* Redirection par défaut vers home */}
                <Route exact path="/tabs">
                  <Redirect to="/tabs/home" />
                </Route>
              </IonRouterOutlet>
              
              {/* Barre de navigation avec 4 tabs Sprint 1 */}
              <IonTabBar slot="bottom" className="tab-bar-minimal">
                <IonTabButton tab="home" href="/tabs/home">
                  <IonIcon aria-hidden="true" icon={homeOutline} />
                  <IonLabel>Accueil</IonLabel>
                </IonTabButton>
                
                <IonTabButton tab="map" href="/tabs/map">
                  <IonIcon aria-hidden="true" icon={mapOutline} />
                  <IonLabel>Carte</IonLabel>
                </IonTabButton>
                
                <IonTabButton tab="favorites" href="/tabs/favorites">
                  <IonIcon aria-hidden="true" icon={heartOutline} />
                  <IonLabel>Favoris</IonLabel>
                </IonTabButton>
                
                <IonTabButton tab="profile" href="/tabs/profile">
                  <IonIcon aria-hidden="true" icon={personOutline} />
                  <IonLabel>Profil</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </Route>

          {/* Routes hors tabs (pages accessibles depuis Profile) */}
          {/* Page Statistiques Avancées - Sprint 4 Phase 6 */}
          <Route exact path="/stats">
            <StatsPage />
          </Route>

          {/* Page Leaderboard - Sprint 4 Phase 6 */}
          <Route exact path="/leaderboard">
            <LeaderboardPage />
          </Route>

          {/* Redirections */}
          <Route exact path="/">
            <Redirect to="/tabs/home" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
    </ServiceWorkerProvider>
  </Provider>
);

export default AppMinimal;