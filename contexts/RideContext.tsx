import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Ride } from '@/types';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';

const RIDES_KEY = '@ridebuddy_rides';

export const [RideProvider, useRides] = createContextHook(() => {
  const { user } = useAuth();
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const ridesQuery = trpc.rides.list.useQuery(undefined, {
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const createRideMutation = trpc.rides.create.useMutation();
  const updateRideMutation = trpc.rides.update.useMutation();



  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      if (isTracking && !isPaused && currentRide && Platform.OS !== 'web') {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            subscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 5000,
                distanceInterval: 10
              },
              (location) => {
                const { latitude, longitude, speed, altitude } = location.coords;
                setCurrentRide((prev) => {
                  if (!prev) return prev;
                  const newCoord = {
                    latitude,
                    longitude,
                    timestamp: Date.now(),
                    speed: speed || 0,
                    altitude: altitude || 0
                  };
                  return {
                    ...prev,
                    coordinates: [...prev.coordinates, newCoord]
                  };
                });
              }
            );
          }
        } catch (error) {
          console.error('Location tracking error:', error);
        }
      }
    };

    startLocationTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [isTracking, isPaused, currentRide]);

  const startRide = async (trailId?: string) => {
    try {
      const startTime = new Date().toISOString();
      const newRide: Ride = {
        id: Date.now().toString(),
        userId: user!.id,
        trailId,
        startTime,
        stats: {
          distance: 0,
          duration: 0,
          elevationGain: 0,
          maxSpeed: 0,
          avgSpeed: 0
        },
        coordinates: []
      };

      const backendRide = await createRideMutation.mutateAsync({
        trailId,
        startTime,
      });

      setCurrentRide({ ...newRide, id: backendRide.id });
      setIsTracking(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Failed to start ride:', error);
      const offlineRide: Ride = {
        id: `offline_${Date.now()}`,
        userId: user!.id,
        trailId,
        startTime: new Date().toISOString(),
        stats: {
          distance: 0,
          duration: 0,
          elevationGain: 0,
          maxSpeed: 0,
          avgSpeed: 0
        },
        coordinates: []
      };
      setCurrentRide(offlineRide);
      setIsTracking(true);
      setIsPaused(false);
    }
  };

  const pauseRide = () => {
    setIsPaused(true);
  };

  const resumeRide = () => {
    setIsPaused(false);
  };

  const stopRide = async () => {
    if (!currentRide) return null;

    const endTime = new Date().toISOString();
    const duration = (new Date(endTime).getTime() - new Date(currentRide.startTime).getTime()) / 1000;
    
    const distance = calculateDistance(currentRide.coordinates);
    const elevationGain = calculateElevationGain(currentRide.coordinates);
    const maxSpeed = calculateMaxSpeed(currentRide.coordinates);
    const avgSpeed = duration > 0 ? distance / (duration / 3600) : 0;

    const completedRide: Ride = {
      ...currentRide,
      endTime,
      stats: {
        distance,
        duration,
        elevationGain,
        maxSpeed,
        avgSpeed
      }
    };

    try {
      await updateRideMutation.mutateAsync({
        id: currentRide.id,
        endTime,
        stats: completedRide.stats,
        coordinates: completedRide.coordinates,
      });
      await ridesQuery.refetch();
    } catch (error) {
      console.error('Failed to save ride to backend:', error);
      const stored = await AsyncStorage.getItem(RIDES_KEY);
      const allRides: Ride[] = stored ? JSON.parse(stored) : [];
      allRides.push(completedRide);
      await AsyncStorage.setItem(RIDES_KEY, JSON.stringify(allRides));
    }

    setCurrentRide(null);
    setIsTracking(false);
    setIsPaused(false);

    return completedRide;
  };

  const calculateDistance = (coords: Ride['coordinates']) => {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      total += getDistanceBetween(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
    }
    return total;
  };

  const calculateElevationGain = (coords: Ride['coordinates']) => {
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const diff = coords[i].altitude - coords[i - 1].altitude;
      if (diff > 0) total += diff;
    }
    return total;
  };

  const calculateMaxSpeed = (coords: Ride['coordinates']) => {
    return Math.max(...coords.map(c => c.speed), 0);
  };

  const getDistanceBetween = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return {
    rides: ridesQuery.data || [],
    currentRide,
    isTracking,
    isPaused,
    startRide,
    pauseRide,
    resumeRide,
    stopRide,
    isLoadingRides: ridesQuery.isLoading,
  };
});
