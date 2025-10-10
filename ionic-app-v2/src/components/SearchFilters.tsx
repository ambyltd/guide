/**
 * Composant SearchFilters - Recherche avancée avec filtres multicritères
 */

import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonRange,
  IonSegment,
  IonSegmentButton,
  IonChip,
  IonSearchbar,
  IonText,
} from '@ionic/react';
import {
  close,
  options,
  search,
  locationOutline,
  star,
  pricetagOutline,
} from 'ionicons/icons';
import './SearchFilters.css';

export interface SearchFiltersState {
  searchText: string;
  categories: string[];
  minRating: number;
  maxDistance: number;
  sortBy: 'distance' | 'rating' | 'name' | 'popular';
  showOnlyFavorites: boolean;
}

interface SearchFiltersProps {
  isOpen: boolean;
  filters: SearchFiltersState;
  onApply: (filters: SearchFiltersState) => void;
  onClose: () => void;
  onReset: () => void;
}

const CATEGORIES = [
  { value: 'Monument', label: 'Monuments', icon: '🏛️' },
  { value: 'Musée', label: 'Musées', icon: '🎨' },
  { value: 'Nature', label: 'Nature', icon: '🌿' },
  { value: 'Plage', label: 'Plages', icon: '🏖️' },
  { value: 'Culture', label: 'Culture', icon: '🎭' },
  { value: 'Gastronomie', label: 'Gastronomie', icon: '🍽️' },
  { value: 'Architecture', label: 'Architecture', icon: '🏗️' },
  { value: 'Parc', label: 'Parcs', icon: '🌳' },
];

const SearchFilters: React.FC<SearchFiltersProps> = ({
  isOpen,
  filters,
  onApply,
  onClose,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<SearchFiltersState>(filters);
  const [activeTab, setActiveTab] = useState<'search' | 'filters' | 'sort'>('search');

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    onReset();
    onClose();
  };

  const toggleCategory = (category: string) => {
    const categories = localFilters.categories.includes(category)
      ? localFilters.categories.filter((c) => c !== category)
      : [...localFilters.categories, category];
    setLocalFilters({ ...localFilters, categories });
  };

  const getActiveFiltersCount = (): number => {
    let count = 0;
    if (localFilters.searchText) count++;
    if (localFilters.categories.length > 0) count++;
    if (localFilters.minRating > 0) count++;
    if (localFilters.maxDistance < 100) count++;
    if (localFilters.showOnlyFavorites) count++;
    return count;
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="search-filters-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            Recherche et filtres
            {getActiveFiltersCount() > 0 && (
              <IonChip color="primary" className="filters-count">
                {getActiveFiltersCount()}
              </IonChip>
            )}
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>

        <IonToolbar>
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as 'search' | 'filters' | 'sort')}
          >
            <IonSegmentButton value="search">
              <IonIcon icon={search} />
              <IonLabel>Recherche</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="filters">
              <IonIcon icon={options} />
              <IonLabel>Filtres</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="sort">
              <IonIcon icon={pricetagOutline} />
              <IonLabel>Tri</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="search-filters-content">
        {/* Onglet Recherche */}
        {activeTab === 'search' && (
          <div className="tab-content">
            <IonSearchbar
              value={localFilters.searchText}
              onIonInput={(e) =>
                setLocalFilters({ ...localFilters, searchText: e.detail.value || '' })
              }
              placeholder="Rechercher une attraction..."
              animated
              showCancelButton="focus"
            />

            <div className="section">
              <h3 className="section-title">Catégories</h3>
              <div className="categories-grid">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat.value}
                    className={`category-chip ${
                      localFilters.categories.includes(cat.value) ? 'selected' : ''
                    }`}
                    onClick={() => toggleCategory(cat.value)}
                  >
                    <span className="category-icon">{cat.icon}</span>
                    <span className="category-label">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {localFilters.categories.length > 0 && (
              <div className="selected-categories">
                <IonText color="medium">
                  <p>Catégories sélectionnées: {localFilters.categories.length}</p>
                </IonText>
                <div className="chips-container">
                  {localFilters.categories.map((cat) => (
                    <IonChip key={cat} color="primary" onClick={() => toggleCategory(cat)}>
                      <IonLabel>{cat}</IonLabel>
                      <IonIcon icon={close} />
                    </IonChip>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Onglet Filtres */}
        {activeTab === 'filters' && (
          <div className="tab-content">
            <IonList>
              {/* Note minimale */}
              <div className="section">
                <IonItem>
                  <IonIcon icon={star} slot="start" color="warning" />
                  <IonLabel>
                    <h3>Note minimale</h3>
                    <p>{localFilters.minRating.toFixed(1)} étoiles</p>
                  </IonLabel>
                </IonItem>
                <div className="range-container">
                  <IonRange
                    value={localFilters.minRating}
                    min={0}
                    max={5}
                    step={0.5}
                    snaps
                    ticks
                    pin
                    onIonChange={(e) =>
                      setLocalFilters({ ...localFilters, minRating: e.detail.value as number })
                    }
                  >
                    <IonLabel slot="start">0</IonLabel>
                    <IonLabel slot="end">5</IonLabel>
                  </IonRange>
                </div>
              </div>

              {/* Distance maximale */}
              <div className="section">
                <IonItem>
                  <IonIcon icon={locationOutline} slot="start" color="primary" />
                  <IonLabel>
                    <h3>Distance maximale</h3>
                    <p>
                      {localFilters.maxDistance === 100
                        ? 'Illimitée'
                        : `${localFilters.maxDistance} km`}
                    </p>
                  </IonLabel>
                </IonItem>
                <div className="range-container">
                  <IonRange
                    value={localFilters.maxDistance}
                    min={1}
                    max={100}
                    step={5}
                    snaps
                    pin
                    onIonChange={(e) =>
                      setLocalFilters({ ...localFilters, maxDistance: e.detail.value as number })
                    }
                  >
                    <IonLabel slot="start">1 km</IonLabel>
                    <IonLabel slot="end">∞</IonLabel>
                  </IonRange>
                </div>
              </div>

              {/* Favoris uniquement */}
              <IonItem>
                <IonLabel>
                  <h3>Afficher uniquement les favoris</h3>
                  <p>Ne montrer que les attractions que vous avez enregistrées</p>
                </IonLabel>
                <IonCheckbox
                  slot="end"
                  checked={localFilters.showOnlyFavorites}
                  onIonChange={(e) =>
                    setLocalFilters({ ...localFilters, showOnlyFavorites: e.detail.checked })
                  }
                />
              </IonItem>
            </IonList>
          </div>
        )}

        {/* Onglet Tri */}
        {activeTab === 'sort' && (
          <div className="tab-content">
            <IonList>
              <IonItem
                button
                detail={false}
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'distance' })}
              >
                <IonIcon icon={locationOutline} slot="start" color="primary" />
                <IonLabel>
                  <h3>Distance</h3>
                  <p>Du plus proche au plus éloigné</p>
                </IonLabel>
                <IonCheckbox slot="end" checked={localFilters.sortBy === 'distance'} />
              </IonItem>

              <IonItem
                button
                detail={false}
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'rating' })}
              >
                <IonIcon icon={star} slot="start" color="warning" />
                <IonLabel>
                  <h3>Note</h3>
                  <p>De la meilleure note à la moins bonne</p>
                </IonLabel>
                <IonCheckbox slot="end" checked={localFilters.sortBy === 'rating'} />
              </IonItem>

              <IonItem
                button
                detail={false}
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'popular' })}
              >
                <IonIcon icon={pricetagOutline} slot="start" color="success" />
                <IonLabel>
                  <h3>Popularité</h3>
                  <p>Du plus visité au moins visité</p>
                </IonLabel>
                <IonCheckbox slot="end" checked={localFilters.sortBy === 'popular'} />
              </IonItem>

              <IonItem
                button
                detail={false}
                onClick={() => setLocalFilters({ ...localFilters, sortBy: 'name' })}
              >
                <IonIcon icon={options} slot="start" color="medium" />
                <IonLabel>
                  <h3>Nom</h3>
                  <p>Par ordre alphabétique</p>
                </IonLabel>
                <IonCheckbox slot="end" checked={localFilters.sortBy === 'name'} />
              </IonItem>
            </IonList>
          </div>
        )}
      </IonContent>

      {/* Footer avec boutons */}
      <div className="modal-footer">
        <IonButton expand="block" fill="clear" onClick={handleReset}>
          Réinitialiser
        </IonButton>
        <IonButton expand="block" onClick={handleApply} color="primary">
          Appliquer ({getActiveFiltersCount()})
        </IonButton>
      </div>
    </IonModal>
  );
};

export default SearchFilters;
