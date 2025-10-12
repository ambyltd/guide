/**
 * Types pour l'application de découverte audio guide - Côte d'Ivoire
 * Architecture experte avec TypeScript strict
 */

// ===== TYPES DE BASE =====
export interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface User extends BaseEntity {
  readonly email: string;
  readonly name: string;
  readonly profileImage?: string;
  readonly preferences: UserPreferences;
  readonly subscription: SubscriptionTier;
}

export interface UserPreferences {
  readonly language: SupportedLanguage;
  readonly audioQuality: AudioQuality;
  readonly downloadOverWifiOnly: boolean;
  readonly notifications: NotificationSettings;
  readonly accessibility: AccessibilitySettings;
}

export interface NotificationSettings {
  readonly nearbyAttractions: boolean;
  readonly tourReminders: boolean;
  readonly newContent: boolean;
  readonly systemUpdates: boolean;
}

export interface AccessibilitySettings {
  readonly fontSize: FontSize;
  readonly highContrast: boolean;
  readonly screenReader: boolean;
  readonly autoplayAudio: boolean;
}

// ===== TYPES D'ATTRACTIONS =====
export interface Attraction extends BaseEntity {
  readonly name: string;
  readonly description: string;
  readonly shortDescription: string;
  readonly location: GeoLocation;
  readonly category: AttractionCategory;
  readonly images: readonly MediaFile[];
  readonly audioGuides: readonly AudioGuide[];
  readonly rating: number;
  readonly visitDuration: number; // en minutes
  readonly accessibility: AccessibilityInfo;
  readonly openingHours: OpeningHours;
  readonly ticketInfo: TicketInfo;
  readonly isActive: boolean;
  readonly metadata: AttractionMetadata;
}

export interface GeoLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude?: number;
  readonly accuracy?: number;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  useNativeAPI?: boolean;
}

export type LocationErrorCode = 1 | 2 | 3 | 99;

export interface LocationError extends Error {
  code: LocationErrorCode;
  isPermissionError: boolean;
  isTimeoutError: boolean;
  isUnavailableError: boolean;
  originalError?: Error;
}

export interface MediaFile {
  readonly id: string;
  readonly url: string;
  readonly type: MediaType;
  readonly caption?: string;
  readonly altText?: string;
  readonly size: number;
  readonly dimensions?: MediaDimensions;
}

export interface MediaDimensions {
  readonly width: number;
  readonly height: number;
}

export interface AccessibilityInfo {
  readonly wheelchairAccessible: boolean;
  readonly hasAudioDescription: boolean;
  readonly hasBrailleInfo: boolean;
  readonly hasSignLanguage: boolean;
  readonly difficultyLevel: DifficultyLevel;
}

export interface OpeningHours {
  readonly monday: DaySchedule;
  readonly tuesday: DaySchedule;
  readonly wednesday: DaySchedule;
  readonly thursday: DaySchedule;
  readonly friday: DaySchedule;
  readonly saturday: DaySchedule;
  readonly sunday: DaySchedule;
  readonly holidays: readonly HolidaySchedule[];
}

export interface DaySchedule {
  readonly isOpen: boolean;
  readonly openTime?: string; // Format HH:MM
  readonly closeTime?: string; // Format HH:MM
  readonly breaks?: readonly TimeSlot[];
}

export interface TimeSlot {
  readonly startTime: string;
  readonly endTime: string;
}

export interface HolidaySchedule {
  readonly date: string; // Format YYYY-MM-DD
  readonly isOpen: boolean;
  readonly specialHours?: DaySchedule;
  readonly note?: string;
}

export interface TicketInfo {
  readonly isFree: boolean;
  readonly prices: readonly TicketPrice[];
  readonly bookingRequired: boolean;
  readonly bookingUrl?: string;
  readonly notes?: string;
}

export interface TicketPrice {
  readonly category: TicketCategory;
  readonly price: number;
  readonly currency: Currency;
  readonly description?: string;
}

export interface AttractionMetadata {
  readonly tags: readonly string[];
  readonly historicalPeriod?: string;
  readonly architect?: string;
  readonly yearBuilt?: number;
  readonly culturalSignificance: CulturalSignificance;
  readonly unscoStatus?: UnescoStatus;
}

// ===== TYPES AUDIO GUIDES =====
export interface AudioGuide extends BaseEntity {
  readonly title: string;
  readonly description: string;
  readonly audioUrl: string;
  readonly duration: number; // en secondes
  readonly language: SupportedLanguage;
  readonly narrator: Narrator;
  readonly transcript: string;
  readonly isAvailableOffline: boolean;
  readonly fileSize: number; // en bytes
  readonly quality: AudioQuality;
  readonly attractionId: string;
  readonly attraction?: {
    id: string;
    name: string;
    images?: readonly MediaFile[];
  };
}

export interface Narrator {
  readonly name: string;
  readonly bio: string;
  readonly profileImage?: string;
  readonly expertise: readonly string[];
}

// ===== TYPES CIRCUITS TOURISTIQUES =====
export interface Tour extends BaseEntity {
  readonly name: string;
  readonly description: string;
  readonly attractions: readonly TourAttraction[];
  readonly estimatedDuration: number; // en minutes
  readonly difficulty: DifficultyLevel;
  readonly themes: readonly TourTheme[];
  readonly startingPoint: GeoLocation;
  readonly endingPoint: GeoLocation;
  readonly route: readonly GeoLocation[];
  readonly isGuided: boolean;
  readonly maxParticipants?: number;
  readonly price?: TicketPrice;
  readonly isActive: boolean;
}

export interface TourAttraction {
  readonly attractionId: string;
  readonly order: number;
  readonly visitDuration: number;
  readonly notes?: string;
  readonly isOptional: boolean;
}

// ===== ÉNUMÉRATIONS =====
export enum SupportedLanguage {
  FRENCH = 'fr',
  ENGLISH = 'en',
  SPANISH = 'es',
  GERMAN = 'de',
  ITALIAN = 'it',
}

export enum AttractionCategory {
  HISTORICAL_SITE = 'historical-site',
  MUSEUM = 'museum',
  CULTURAL_CENTER = 'cultural-center',
  NATURAL_SITE = 'natural-site',
  RELIGIOUS_SITE = 'religious-site',
  MARKET = 'market',
  BEACH = 'beach',
  PARK = 'park',
  MONUMENT = 'monument',
  TRADITIONAL_VILLAGE = 'traditional-village',
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum AudioQuality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  LOSSLESS = 'lossless',
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  EXTRA_LARGE = 'extra-large',
}

export enum DifficultyLevel {
  VERY_EASY = 'very-easy',
  EASY = 'easy',
  MODERATE = 'moderate',
  CHALLENGING = 'challenging',
  DIFFICULT = 'difficult',
}

export enum TicketCategory {
  ADULT = 'adult',
  CHILD = 'child',
  STUDENT = 'student',
  SENIOR = 'senior',
  GROUP = 'group',
  FAMILY = 'family',
}

export enum Currency {
  XOF = 'XOF', // Franc CFA
  EUR = 'EUR',
  USD = 'USD',
}

export enum CulturalSignificance {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXCEPTIONAL = 'exceptional',
}

export enum UnescoStatus {
  WORLD_HERITAGE = 'world-heritage',
  TENTATIVE_LIST = 'tentative-list',
  INTANGIBLE_HERITAGE = 'intangible-heritage',
}

export enum TourTheme {
  HISTORICAL = 'historical',
  CULTURAL = 'cultural',
  NATURAL = 'natural',
  RELIGIOUS = 'religious',
  CULINARY = 'culinary',
  ARTISTIC = 'artistic',
  ARCHITECTURAL = 'architectural',
  EDUCATIONAL = 'educational',
}

export enum SubscriptionTier {
  FREE = 'free',
  PREMIUM = 'premium',
  PROFESSIONAL = 'professional',
}

// ===== TYPES D'API =====
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly timestamp: string;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly totalItems: number;
  readonly totalPages: number;
  readonly currentPage: number;
  readonly itemsPerPage: number;
}

export interface SearchFilters {
  readonly category?: AttractionCategory;
  readonly themes?: readonly TourTheme[];
  readonly difficulty?: DifficultyLevel;
  readonly maxDuration?: number;
  readonly location?: GeoLocation;
  readonly radius?: number; // en kilomètres
  readonly languages?: readonly SupportedLanguage[];
  readonly freeOnly?: boolean;
  readonly accessibleOnly?: boolean;
}

// ===== TYPES D'ÉTAT GLOBAL =====
export interface AppState {
  readonly auth: AuthState;
  readonly attractions: AttractionsState;
  readonly tours: ToursState;
  readonly audioGuides: AudioGuidesState;
  readonly user: UserState;
  readonly offline: OfflineState;
  readonly ui: UiState;
}

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly user: User | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export interface AttractionsState {
  readonly items: readonly Attraction[];
  readonly selectedAttraction: Attraction | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly filters: SearchFilters;
}

export interface ToursState {
  readonly items: readonly Tour[];
  readonly selectedTour: Tour | null;
  readonly loading: boolean;
  readonly error: string | null;
}

export interface AudioGuidesState {
  readonly items: readonly AudioGuide[];
  readonly currentlyPlaying: AudioGuide | null;
  readonly playbackPosition: number;
  readonly downloadedGuides: readonly string[];
  readonly loading: boolean;
  readonly error: string | null;
}

export interface UserState {
  readonly preferences: UserPreferences;
  readonly visitHistory: readonly string[];
  readonly favorites: readonly string[];
  readonly downloadQueue: readonly string[];
}

export interface OfflineState {
  readonly isOnline: boolean;
  readonly downloadedContent: readonly string[];
  readonly syncStatus: SyncStatus;
  readonly lastSyncTime: Date | null;
}

export interface UiState {
  readonly activeTab: AppTab;
  readonly mapView: MapViewState;
  readonly searchQuery: string;
  readonly notifications: readonly AppNotification[];
}

export interface MapViewState {
  readonly center: GeoLocation;
  readonly zoom: number;
  readonly selectedAttraction: string | null;
  readonly showUserLocation: boolean;
}

export interface AppNotification {
  readonly id: string;
  readonly type: NotificationType;
  readonly title: string;
  readonly message: string;
  readonly timestamp: Date;
  readonly isRead: boolean;
  readonly actionUrl?: string;
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum AppTab {
  HOME = 'home',
  EXPLORE = 'explore',
  MAP = 'map',
  TOURS = 'tours',
  PROFILE = 'profile',
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}