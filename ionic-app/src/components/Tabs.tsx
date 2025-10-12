/**
 * Composant Tabs - Navigation principale de l'application
 */

import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import {
  homeOutline,
  mapOutline,
  playCircleOutline,
  personOutline,
  heartOutline,
} from 'ionicons/icons';

/* Pages */
import HomePage from '../pages/Home';
import MapPage from '../pages/Map';
import AudioGuidesPage from '../pages/AudioGuides';
import AttractionDetailPage from '../pages/AttractionDetail';
import ProfilePage from '../pages/Profile';
import FavoritesPage from '../pages/Favorites';

const Tabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        {/* Routes principales */}
        <Route exact path="/home" component={HomePage} />
        <Route exact path="/map" component={MapPage} />
        <Route exact path="/audioguides" component={AudioGuidesPage} />
        <Route exact path="/favorites" component={FavoritesPage} />
        <Route exact path="/profile" component={ProfilePage} />
        
        {/* Route détails attraction */}
        <Route exact path="/attraction/:id" component={AttractionDetailPage} />
        
        {/* Redirection par défaut */}
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>

      {/* Barre de navigation */}
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={homeOutline} />
          <IonLabel>Accueil</IonLabel>
        </IonTabButton>

        <IonTabButton tab="map" href="/map">
          <IonIcon icon={mapOutline} />
          <IonLabel>Carte</IonLabel>
        </IonTabButton>

        <IonTabButton tab="audioguides" href="/audioguides">
          <IonIcon icon={playCircleOutline} />
          <IonLabel>Guides</IonLabel>
        </IonTabButton>

        <IonTabButton tab="favorites" href="/favorites">
          <IonIcon icon={heartOutline} />
          <IonLabel>Favoris</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/profile">
          <IonIcon icon={personOutline} />
          <IonLabel>Profil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;
