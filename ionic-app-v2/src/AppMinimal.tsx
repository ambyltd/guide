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
import { libraryOutline, bookmarkOutline } from 'ionicons/icons';

/* Pages d'authentification (à garder) */
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

/* Components */
import { GuestOnly } from './components/ProtectedRoute';

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

const AppMinimal: React.FC = () => (
  <Provider store={store}>
    <IonApp>
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

          {/* Application principale - Pages supprimées */}
          <Route path="/tabs">
            <IonTabs>
              <IonRouterOutlet>
                {/* Pages AttractionsMinimal et ReservationsMinimal ont été supprimées */}
                {/* Utilisez App.tsx avec les pages complètes à la place */}
                
                {/* Redirection par défaut vers login */}
                <Route exact path="/tabs">
                  <Redirect to="/login" />
                </Route>
              </IonRouterOutlet>
              
              {/* Barre de navigation avec 2 tabs */}
              <IonTabBar slot="bottom" className="tab-bar-minimal">
                <IonTabButton tab="attractions" href="/tabs/attractions">
                  <IonIcon aria-hidden="true" icon={libraryOutline} />
                  <IonLabel>Attractions</IonLabel>
                </IonTabButton>
                
                <IonTabButton tab="reservations" href="/tabs/reservations">
                  <IonIcon aria-hidden="true" icon={bookmarkOutline} />
                  <IonLabel>Réservations</IonLabel>
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </Route>

          {/* Redirections */}
          <Route exact path="/">
            <Redirect to="/tabs/attractions" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </Provider>
);

export default AppMinimal;
