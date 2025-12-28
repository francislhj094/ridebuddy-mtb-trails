import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Play, Pause, Square, MapPin, Clock, TrendingUp, Gauge, Locate } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRides } from '@/contexts/RideContext';
import { useSettings } from '@/contexts/SettingsContext';

const motivationalMessages = [
  'Keep pushing! 💪',
  'You\'re doing great!',
  'Feel the ride! 🚵',
  'Stay strong!',
  'Awesome pace!',
  'You\'ve got this!',
  'Keep going!',
  'Great progress! 🎯',
  'Crushing it!',
  'Stay focused!'
];

export default function RideScreen() {
  const router = useRouter();
  const { currentRide, isTracking, isPaused, startRide, pauseRide, resumeRide, stopRide } = useRides();
  const { convertDistance, convertSpeed, convertElevation, distanceUnit, speedUnit, elevationUnit } = useSettings();
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [pulseAnim] = useState(() => new Animated.Value(1));
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [motivationalMessage, setMotivationalMessage] = useState('');
  const [messageOpacity] = useState(() => new Animated.Value(0));
  const scaleAnim = useState(() => new Animated.Value(1))[0];

  const showMotivationalMessage = useCallback(() => {
    const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    setMotivationalMessage(randomMessage);
    
    Animated.sequence([
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(2500),
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [messageOpacity]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let messageInterval: ReturnType<typeof setInterval> | undefined;
    
    if (isTracking && !isPaused && currentRide) {
      interval = setInterval(() => {
        const elapsed = (Date.now() - new Date(currentRide.startTime).getTime()) / 1000;
        setElapsedTime(elapsed);
        
        if (currentRide.coordinates.length > 0) {
          const lastCoord = currentRide.coordinates[currentRide.coordinates.length - 1];
          setCurrentSpeed(lastCoord.speed * 3.6);
        }
      }, 1000);

      messageInterval = setInterval(() => {
        showMotivationalMessage();
      }, 30000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [isTracking, isPaused, currentRide, showMotivationalMessage]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const getCurrentLocation = async () => {
      if (Platform.OS !== 'web') {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            locationSubscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 2000,
                distanceInterval: 10,
              },
              (location) => {
                setUserLocation({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
              }
            );
          }
        } catch (error) {
          console.error('Location error:', error);
        }
      }
    };

    getCurrentLocation();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isTracking && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isTracking, isPaused, pulseAnim]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startRide();
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pauseRide();
  };

  const handleResume = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resumeRide();
  };

  const handleStop = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const completedRide = await stopRide();
    if (completedRide) {
      router.push('/ride-summary');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateDistance = () => {
    if (!currentRide || currentRide.coordinates.length === 0) return 0;
    return currentRide.coordinates.length * 0.005;
  };

  const calculateElevation = () => {
    if (!currentRide || currentRide.coordinates.length < 2) return 0;
    const coords = currentRide.coordinates;
    let total = 0;
    for (let i = 1; i < coords.length; i++) {
      const diff = coords[i].altitude - coords[i - 1].altitude;
      if (diff > 0) total += diff;
    }
    return total;
  };

  const centerOnUser = () => {
    if (mapRef && userLocation) {
      mapRef.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  };

  return (
    <View style={styles.container}>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Track Ride</Text>
        {isTracking && (
          <Animated.View style={[styles.statusBadge, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{isPaused ? 'Paused' : 'Recording'}</Text>
          </Animated.View>
        )}
      </View>

      {userLocation && (
        <View style={styles.mapContainer}>
          <MapView
            ref={(ref) => setMapRef(ref)}
            style={styles.map}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {currentRide && currentRide.coordinates.length > 1 && (
              <Polyline
                coordinates={currentRide.coordinates.map(coord => ({
                  latitude: coord.latitude,
                  longitude: coord.longitude,
                }))}
                strokeColor="#000000"
                strokeWidth={4}
              />
            )}
          </MapView>
          <TouchableOpacity 
            style={styles.centerButton}
            onPress={centerOnUser}
            activeOpacity={0.8}
          >
            <Locate size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsContainer}>
        {isTracking && motivationalMessage && (
          <Animated.View style={[styles.motivationalBanner, { opacity: messageOpacity }]}>
            <LinearGradient
              colors={['#000000', '#1A1A1A']}
              style={styles.motivationalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.motivationalText}>{motivationalMessage}</Text>
            </LinearGradient>
          </Animated.View>
        )}

        <Animated.View style={[styles.mainStat, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.speedCircle}>
            <LinearGradient
              colors={['#00000020', '#00000010']}
              style={styles.speedCircleGradient}
            >
              <Gauge size={56} color="#000000" strokeWidth={3} />
              <Text style={styles.mainStatValue}>
                {convertSpeed(currentSpeed).toFixed(1)}
              </Text>
              <Text style={styles.mainStatLabel}>{speedUnit}</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Clock size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{formatTime(elapsedTime)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>

          <View style={styles.statCard}>
            <MapPin size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>
              {convertDistance(calculateDistance()).toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>{distanceUnit}</Text>
          </View>

          <View style={styles.statCard}>
            <TrendingUp size={24} color="#F59E0B" />
            <Text style={styles.statValue}>
              {convertElevation(calculateElevation()).toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>{elevationUnit}</Text>
          </View>
        </View>
      </View>

      <View style={styles.controls}>
        {!isTracking ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#000000', '#1A1A1A']}
              style={styles.startButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
              <Text style={styles.startButtonText}>Start Ride</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={styles.activeControls}>
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={isPaused ? handleResume : handlePause}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.controlButtonGradient}
              >
                {isPaused ? (
                  <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.stopButton}
              onPress={handleStop}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.stopButtonGradient}
              >
                <Square size={24} color="#FFFFFF" fill="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 20,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00000020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000000',
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  motivationalBanner: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  motivationalGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  motivationalText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  mainStat: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  speedCircle: {
    borderRadius: 160,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  speedCircleGradient: {
    width: 280,
    height: 280,
    borderRadius: 140,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#00000030',
  },
  mainStatValue: {
    fontSize: 88,
    fontWeight: '800',
    color: '#000000',
    marginTop: 8,
    letterSpacing: -2,
  },
  mainStatLabel: {
    fontSize: 22,
    color: '#000000',
    fontWeight: '700',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '600',
  },
  controls: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  startButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  startButtonGradient: {
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  controlButtonGradient: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    borderRadius: 20,
    paddingHorizontal: 32,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  stopButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#000000',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
