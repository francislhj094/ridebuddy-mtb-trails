export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type TrailDifficulty = 'Easy' | 'Intermediate' | 'Advanced' | 'Expert';
export type TrailCondition = 'Open' | 'Muddy' | 'Closed';

export interface Trail {
  id: string;
  name: string;
  difficulty: TrailDifficulty;
  distance: number;
  elevationGain: number;
  description: string;
  latitude: number;
  longitude: number;
  image: string;
  photos: string[];
  rating: number;
  ratingCount: number;
  condition: TrailCondition;
  userRatings?: { [userId: string]: number };
}

export interface RideStats {
  distance: number;
  duration: number;
  elevationGain: number;
  maxSpeed: number;
  avgSpeed: number;
}

export interface Ride {
  id: string;
  userId: string;
  trailId?: string;
  startTime: string;
  endTime?: string;
  stats: RideStats;
  coordinates: {
    latitude: number;
    longitude: number;
    timestamp: number;
    speed: number;
    altitude: number;
  }[];
}

export type Units = 'metric' | 'imperial';

export interface AppSettings {
  units: Units;
}

export type AchievementId = 
  | 'first_ride'
  | 'century'
  | 'climber'
  | 'explorer'
  | 'consistent'
  | 'speed_demon';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
  requirement: {
    type: 'rides' | 'distance' | 'elevation' | 'trails' | 'streak' | 'speed';
    target: number;
  };
  unlockedAt?: string;
}

export interface AchievementProgress {
  achievementId: AchievementId;
  current: number;
  target: number;
  unlocked: boolean;
}
