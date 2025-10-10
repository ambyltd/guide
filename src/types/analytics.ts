export interface IUserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  deviceInfo: {
    platform: 'ios' | 'android' | 'web';
    version: string;
    userAgent: string;
    screenResolution?: string;
    language: string;
  };
  locationData: {
    startLocation?: IGeolocation;
    endLocation?: IGeolocation;
    trackingPoints: ILocationTrackingPoint[];
  };
  interactions: IUserInteraction[];
  performance: {
    loadTime: number;
    errorCount: number;
    crashReports: ICrashReport[];
  };
}

export interface IGeolocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

export interface ILocationTrackingPoint extends IGeolocation {
  distanceFromPrevious?: number;
  timeFromPrevious?: number;
  speed?: number;
  context: 'navigation' | 'listening' | 'exploring' | 'searching';
}

export interface IUserInteraction {
  type: 'tap' | 'scroll' | 'swipe' | 'search' | 'play' | 'pause' | 'skip' | 'favorite' | 'share';
  target: string;
  targetId?: string;
  coordinates?: { x: number; y: number };
  timestamp: Date;
  context: string;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface ICrashReport {
  type: 'crash' | 'error' | 'warning';
  message: string;
  stack?: string;
  timestamp: Date;
  context: Record<string, any>;
}

export interface IListeningBehavior {
  audioGuideId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  completionPercentage: number;
  pauseCount: number;
  rewindCount: number;
  skipCount: number;
  volumeChanges: number;
  location: IGeolocation;
  interruptionReasons: string[];
  qualityRating?: number;
}

export interface INavigationPattern {
  userId: string;
  route: IGeolocation[];
  startTime: Date;
  endTime: Date;
  totalDistance: number;
  averageSpeed: number;
  stopsCount: number;
  stops: {
    location: IGeolocation;
    duration: number;
    attractionId?: string;
  }[];
  deviations: {
    fromRecommended: number;
    reasonsDetected: string[];
  };
}

export interface IContentEngagement {
  contentType: 'attraction' | 'audioguide' | 'tour' | 'review';
  contentId: string;
  userId: string;
  timestamp: Date;
  engagementType: 'view' | 'like' | 'share' | 'bookmark' | 'review' | 'complete';
  timeSpent: number;
  scrollDepth?: number;
  location?: IGeolocation;
  context: Record<string, any>;
}

export interface ISearchAnalytics {
  query: string;
  userId: string;
  timestamp: Date;
  location?: IGeolocation;
  filters: Record<string, any>;
  resultsCount: number;
  clickedResults: string[];
  refinements: string[];
  abandonedAt?: 'input' | 'results' | 'filter';
  sessionId: string;
}

export interface IBehaviorCluster {
  clusterId: string;
  name: string;
  description: string;
  userIds: string[];
  characteristics: {
    averageSessionDuration: number;
    preferredCategories: string[];
    peakUsageHours: number[];
    averageDistance: number;
    devicePreferences: string[];
    locationPatterns: IGeolocation[];
  };
  recommendations: string[];
  updatedAt: Date;
}

export interface IPersonalizationProfile {
  userId: string;
  preferences: {
    categories: Record<string, number>; // Score par catégorie
    timeOfDay: Record<string, number>;
    duration: 'short' | 'medium' | 'long';
    language: string;
    difficulty: 'easy' | 'moderate' | 'expert';
  };
  behaviorScore: {
    explorer: number; // 0-1
    planner: number;
    social: number;
    local: number;
    cultural: number;
  };
  visitPatterns: {
    frequency: 'occasional' | 'regular' | 'frequent';
    seasonality: Record<string, number>;
    groupSize: number;
    repeatVisitor: boolean;
  };
  recommendations: {
    nextAttractions: string[];
    optimalRoutes: string[];
    personalizedContent: string[];
  };
  lastUpdated: Date;
}

export interface IBusinessMetrics {
  date: Date;
  dailyActiveUsers: number;
  newUsers: number;
  retention: {
    day1: number;
    day7: number;
    day30: number;
  };
  engagement: {
    averageSessionDuration: number;
    averageScreenTime: number;
    bounceRate: number;
  };
  content: {
    topAttractions: string[];
    topAudioGuides: string[];
    completionRates: Record<string, number>;
  };
  revenue: {
    premiumSubscriptions: number;
    totalRevenue: number;
    averageRevenuePerUser: number;
  };
  technical: {
    errorRate: number;
    crashRate: number;
    loadTime: number;
    apiResponseTime: number;
  };
}

export interface IPredictiveInsight {
  type: 'churn_risk' | 'upsell_opportunity' | 'content_recommendation' | 'route_optimization';
  userId?: string;
  confidence: number; // 0-1
  prediction: Record<string, any>;
  features: Record<string, number>;
  actionable: {
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
    expectedImpact: number;
  };
  validUntil: Date;
  createdAt: Date;
}