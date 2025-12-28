import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useEffect, useState } from 'react';
import { Achievement, AchievementId, AchievementProgress } from '@/types';
import { useAuth } from './AuthContext';
import { useRides } from './RideContext';

const ACHIEVEMENTS_KEY = '@ridebuddy_achievements';

const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  {
    id: 'first_ride',
    title: 'First Ride',
    description: 'Complete your first ride',
    icon: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=200&h=200&fit=crop',
    requirement: { type: 'rides', target: 1 }
  },
  {
    id: 'century',
    title: 'Century',
    description: 'Ride 100 total miles',
    icon: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=200&h=200&fit=crop',
    requirement: { type: 'distance', target: 160.934 }
  },
  {
    id: 'climber',
    title: 'Climber',
    description: 'Gain 10,000 feet of elevation',
    icon: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop',
    requirement: { type: 'elevation', target: 3048 }
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Visit 10 different trails',
    icon: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop',
    requirement: { type: 'trails', target: 10 }
  },
  {
    id: 'consistent',
    title: 'Consistent',
    description: 'Ride 7 days in a row',
    icon: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200&h=200&fit=crop',
    requirement: { type: 'streak', target: 7 }
  },
  {
    id: 'speed_demon',
    title: 'Speed Demon',
    description: 'Reach 30+ mph on a ride',
    icon: 'https://images.unsplash.com/photo-1558981852-426c6c22a060?w=200&h=200&fit=crop',
    requirement: { type: 'speed', target: 13.4112 }
  }
];

export const [AchievementsProvider, useAchievements] = createContextHook(() => {
  const { user } = useAuth();
  const { rides } = useRides();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Map<AchievementId, string>>(new Map());
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);

  const loadAchievements = useCallback(async () => {
    if (!user) return;
    try {
      const stored = await AsyncStorage.getItem(`${ACHIEVEMENTS_KEY}_${user.id}`);
      if (stored) {
        const data: [AchievementId, string][] = JSON.parse(stored);
        setUnlockedAchievements(new Map(data));
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }, [user]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const dismissNotification = useCallback(() => {
    setNewlyUnlockedAchievement(null);
  }, []);

  const calculateStreak = useCallback((): number => {
    if (rides.length === 0) return 0;

    const sortedRides = [...rides].sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    const rideDates = sortedRides.map(ride => {
      const date = new Date(ride.startTime);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    });

    const uniqueDates = Array.from(new Set(rideDates)).sort((a, b) => b - a);

    let streak = 1;
    const today = new Date();
    const todayTimestamp = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (uniqueDates[0] !== todayTimestamp && uniqueDates[0] !== todayTimestamp - oneDayMs) {
      return 0;
    }

    for (let i = 1; i < uniqueDates.length; i++) {
      const diff = uniqueDates[i - 1] - uniqueDates[i];
      if (diff === oneDayMs) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [rides]);

  const checkAchievements = useCallback(() => {
    const totalDistance = rides.reduce((sum, ride) => sum + ride.stats.distance, 0);
    const totalElevation = rides.reduce((sum, ride) => sum + ride.stats.elevationGain, 0);
    const totalRides = rides.length;
    const maxSpeed = Math.max(...rides.map(r => r.stats.maxSpeed), 0);
    const uniqueTrails = new Set(rides.filter(r => r.trailId).map(r => r.trailId)).size;
    const currentStreak = calculateStreak();

    setUnlockedAchievements((prev) => {
      let hasChanges = false;
      const newUnlocked = new Map(prev);

      const checkAndUnlock = (id: AchievementId, condition: boolean) => {
        if (condition && !prev.has(id)) {
          hasChanges = true;
          const now = new Date().toISOString();
          newUnlocked.set(id, now);
          const achievement = ACHIEVEMENT_DEFINITIONS.find(a => a.id === id);
          if (achievement) {
            setNewlyUnlockedAchievement({ ...achievement, unlockedAt: now });
          }
        }
      };

      checkAndUnlock('first_ride', totalRides >= 1);
      checkAndUnlock('century', totalDistance >= 160.934);
      checkAndUnlock('climber', totalElevation >= 3048);
      checkAndUnlock('explorer', uniqueTrails >= 10);
      checkAndUnlock('consistent', currentStreak >= 7);
      checkAndUnlock('speed_demon', maxSpeed >= 13.4112);

      if (hasChanges && user) {
        const data = Array.from(newUnlocked.entries());
        AsyncStorage.setItem(`${ACHIEVEMENTS_KEY}_${user.id}`, JSON.stringify(data)).catch(err => {
          console.error('Failed to save achievements:', err);
        });
        return newUnlocked;
      }

      return prev;
    });
  }, [rides, calculateStreak, user]);

  useEffect(() => {
    if (user && rides.length > 0) {
      checkAchievements();
    }
  }, [rides, user, checkAchievements]);

  const getProgress = (): AchievementProgress[] => {
    const totalDistance = rides.reduce((sum, ride) => sum + ride.stats.distance, 0);
    const totalElevation = rides.reduce((sum, ride) => sum + ride.stats.elevationGain, 0);
    const totalRides = rides.length;
    const maxSpeed = Math.max(...rides.map(r => r.stats.maxSpeed), 0);
    const uniqueTrails = new Set(rides.filter(r => r.trailId).map(r => r.trailId)).size;
    const currentStreak = calculateStreak();

    return ACHIEVEMENT_DEFINITIONS.map(achievement => {
      let current = 0;
      switch (achievement.requirement.type) {
        case 'rides':
          current = totalRides;
          break;
        case 'distance':
          current = totalDistance;
          break;
        case 'elevation':
          current = totalElevation;
          break;
        case 'trails':
          current = uniqueTrails;
          break;
        case 'streak':
          current = currentStreak;
          break;
        case 'speed':
          current = maxSpeed;
          break;
      }

      return {
        achievementId: achievement.id,
        current: Math.min(current, achievement.requirement.target),
        target: achievement.requirement.target,
        unlocked: unlockedAchievements.has(achievement.id)
      };
    });
  };

  const getAchievements = (): Achievement[] => {
    return ACHIEVEMENT_DEFINITIONS.map(achievement => ({
      ...achievement,
      unlockedAt: unlockedAchievements.get(achievement.id)
    }));
  };

  return {
    achievements: getAchievements(),
    progress: getProgress(),
    newlyUnlockedAchievement,
    dismissNotification,
    unlockedCount: unlockedAchievements.size
  };
});
