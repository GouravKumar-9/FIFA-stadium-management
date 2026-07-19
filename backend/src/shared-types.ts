export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  detectedLanguage?: string;
  citations?: string[];
}

export interface RouteStep {
  instruction: string;
  accessible: boolean;
  type: 'general' | 'ramp' | 'elevator' | 'stairs' | 'gate' | 'seating';
}

export interface NavigationRoute {
  steps: RouteStep[];
  accessible: boolean;
  durationMins: number;
  distanceMeters: number;
  svgPath: string; // Coordinate visualization overlay
  startLocation: string;
  destination: string;
  persona: 'general' | 'wheelchair' | 'visual' | 'stroller';
}

export interface SensorData {
  gateId: string;
  gateName: string;
  currentCount: number;
  capacity: number;
  densityPercent: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface CrowdBriefing {
  timestamp: number;
  briefingText: string;
  alertLevel: 'info' | 'warning' | 'danger';
  recommendedActions: {
    id: string;
    action: string;
    targetGate: string;
    status: 'pending' | 'approved' | 'dismissed';
  }[];
}

export interface IncidentReport {
  id: string;
  description: string;
  category: 'facilities' | 'medical' | 'security' | 'crowd' | 'other';
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolving' | 'resolved';
  timestamp: number;
  suggestedAction: string;
  location: string;
  multilingualAnnouncements?: Record<string, string>; // language code -> text
}

export interface TransitOption {
  mode: 'shuttle' | 'metro' | 'rideshare' | 'walk' | 'driving';
  co2SavedKg: number;
  timeMins: number;
  co2EmittedKg: number;
  costUsd: number;
  details: string;
}

export interface SustainabilityForecast {
  attendanceForecast: number;
  predictedEnergyMwh: number;
  predictedWasteTons: number;
  carbonFootprintKg: number;
  aiRecommendations: string[];
  timestamp: number;
}
