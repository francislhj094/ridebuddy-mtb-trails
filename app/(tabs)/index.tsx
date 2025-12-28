import { Image } from 'expo-image';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { MapPin, TrendingUp, Star, Play, Locate, SlidersHorizontal } from 'lucide-react-native';
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Platform, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getDifficultyColor, getConditionColor } from '@/constants/trails';
import { useTrails } from '@/contexts/TrailsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useRides } from '@/contexts/RideContext';
import { Trail, TrailDifficulty } from '@/types';

export default function DiscoverScreen() {
  const router = useRouter();
  const { convertDistance, convertElevation, distanceUnit, elevationUnit } = useSettings();
  const { startRide } = useRides();
  const { trails } = useTrails();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRef, setMapRef] = useState<MapView | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDifficulties, setSelectedDifficulties] = useState<TrailDifficulty[]>([]);
  const [distanceRange, setDistanceRange] = useState<{ min: number; max: number }>({ min: 0, max: 20 });
  const [elevationRange, setElevationRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const fadeAnim = useState(() => new Animated.Value(0))[0];
  const scaleAnim = useState(() => new Animated.Value(0.95))[0];

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredTrails = useMemo(() => {
    return trails.filter(trail => {
      const matchesSearch = trail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trail.difficulty.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDifficulty = selectedDifficulties.length === 0 || 
        selectedDifficulties.includes(trail.difficulty);
      
      const matchesDistance = trail.distance >= distanceRange.min && 
        trail.distance <= distanceRange.max;
      
      const matchesElevation = trail.elevationGain >= elevationRange.min && 
        trail.elevationGain <= elevationRange.max;
      
      return matchesSearch && matchesDifficulty && matchesDistance && matchesElevation;
    }).sort((a, b) => {
      if (!userLocation) return 0;
      const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
      const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  }, [searchQuery, selectedDifficulties, distanceRange, elevationRange, userLocation, trails]);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const getCurrentLocation = async () => {
      if (Platform.OS !== 'web') {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
            
            locationSubscription = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 10000,
                distanceInterval: 50,
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

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [fadeAnim, scaleAnim]);

  const toggleDifficulty = (difficulty: TrailDifficulty) => {
    setSelectedDifficulties(current => 
      current.includes(difficulty)
        ? current.filter(d => d !== difficulty)
        : [...current, difficulty]
    );
  };

  const resetFilters = () => {
    setSelectedDifficulties([]);
    setDistanceRange({ min: 0, max: 20 });
    setElevationRange({ min: 0, max: 1000 });
  };

  const getTrailDistance = (trail: Trail): number | null => {
    if (!userLocation) return null;
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      trail.latitude,
      trail.longitude
    );
  };

  const centerOnUser = () => {
    if (mapRef && userLocation) {
      mapRef.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }, 500);
    }
  };

  const renderTrailCard = (trail: Trail) => {
    const difficultyColor = getDifficultyColor(trail.difficulty);
    const conditionColor = getConditionColor(trail.condition);
    const distanceFromUser = getTrailDistance(trail);
    
    return (
      <TouchableOpacity
        key={trail.id}
        style={styles.trailCard}
        onPress={async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/trail/${trail.id}`);
        }}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: trail.image }}
          style={styles.trailImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.imageGradient}
        />
        <View style={[styles.conditionBadge, { backgroundColor: conditionColor }]}>
          <Text style={styles.conditionText}>{trail.condition}</Text>
        </View>
        <View style={styles.trailInfo}>
          <View style={styles.trailHeader}>
            <Text style={styles.trailName} numberOfLines={1}>{trail.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.ratingText}>{trail.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
            <Text style={styles.difficultyText}>
              {trail.difficulty}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MapPin size={16} color="#9CA3AF" />
              <Text style={styles.statText}>
                {convertDistance(trail.distance).toFixed(1)} {distanceUnit}
              </Text>
            </View>
            <View style={styles.statItem}>
              <TrendingUp size={16} color="#9CA3AF" />
              <Text style={styles.statText}>
                {convertElevation(trail.elevationGain).toFixed(0)} {elevationUnit}
              </Text>
            </View>
          </View>
          
          {distanceFromUser !== null && (
            <Text style={styles.distanceFromUser}>
              {distanceFromUser.toFixed(1)} km away
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Stack.Screen options={{ headerShown: false }} />
        
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
        <Text style={styles.headerTitle}>RideBuddy</Text>
        <Text style={styles.headerSubtitle}>Discover your next adventure</Text>
          </View>

          <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trails..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowFilters(true);
          }}
          activeOpacity={0.7}
        >
          <SlidersHorizontal size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation
            showsMyLocationButton={false}
          >
            {trails.map((trail) => (
              <Marker
                key={trail.id}
                coordinate={{
                  latitude: trail.latitude,
                  longitude: trail.longitude,
                }}
                onPress={() => router.push(`/trail/${trail.id}`)}
                pinColor={getDifficultyColor(trail.difficulty)}
              />
            ))}
          </MapView>
          <TouchableOpacity 
            style={styles.mapCenterButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              centerOnUser();
            }}
            activeOpacity={0.8}
          >
            <Locate size={20} color="#FFFFFF" />
          </TouchableOpacity>
            </View>
          )}

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
        <Text style={styles.sectionTitle}>
          {filteredTrails.length} trails near you
        </Text>
        
        {filteredTrails.map(renderTrailCard)}
        
            <View style={styles.bottomPadding} />
          </ScrollView>

          <TouchableOpacity
            style={styles.floatingButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              await startRide();
              router.push('/(tabs)/ride');
            }}
            activeOpacity={0.9}
          >
        <LinearGradient
          colors={['#000000', '#1A1A1A']}
          style={styles.floatingButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.floatingButtonText}>Start Ride</Text>
        </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Difficulty</Text>
                <View style={styles.difficultyFilters}>
                  {(['Easy', 'Intermediate', 'Advanced', 'Expert'] as TrailDifficulty[]).map(difficulty => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.difficultyFilterChip,
                        { backgroundColor: getDifficultyColor(difficulty) },
                        !selectedDifficulties.includes(difficulty) && styles.difficultyFilterChipInactive
                      ]}
                      onPress={async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleDifficulty(difficulty);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.difficultyFilterText,
                        !selectedDifficulties.includes(difficulty) && styles.difficultyFilterTextInactive
                      ]}>
                        {difficulty}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Distance Range (km)</Text>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    value={distanceRange.min.toString()}
                    onChangeText={(text) => setDistanceRange(prev => ({ ...prev, min: parseFloat(text) || 0 }))}
                    keyboardType="numeric"
                    placeholder="Min"
                    placeholderTextColor="#6B7280"
                  />
                  <Text style={styles.rangeSeparator}>to</Text>
                  <TextInput
                    style={styles.rangeInput}
                    value={distanceRange.max.toString()}
                    onChangeText={(text) => setDistanceRange(prev => ({ ...prev, max: parseFloat(text) || 20 }))}
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor="#6B7280"
                  />
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Elevation Range (m)</Text>
                <View style={styles.rangeInputs}>
                  <TextInput
                    style={styles.rangeInput}
                    value={elevationRange.min.toString()}
                    onChangeText={(text) => setElevationRange(prev => ({ ...prev, min: parseFloat(text) || 0 }))}
                    keyboardType="numeric"
                    placeholder="Min"
                    placeholderTextColor="#6B7280"
                  />
                  <Text style={styles.rangeSeparator}>to</Text>
                  <TextInput
                    style={styles.rangeInput}
                    value={elevationRange.max.toString()}
                    onChangeText={(text) => setElevationRange(prev => ({ ...prev, max: parseFloat(text) || 1000 }))}
                    keyboardType="numeric"
                    placeholder="Max"
                    placeholderTextColor="#6B7280"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.resetButton}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  resetFilters();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  filterButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapCenterButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#000000',
    width: 36,
    height: 36,
    borderRadius: 18,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  trailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trailImage: {
    width: '100%',
    height: 180,
  },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  conditionBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  conditionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trailInfo: {
    padding: 16,
  },
  trailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trailName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FBBF24',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  difficultyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  distanceFromUser: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
    marginTop: 8,
  },
  bottomPadding: {
    height: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    borderRadius: 28,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  floatingButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 28,
  },
  floatingButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  filterSection: {
    marginBottom: 28,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  difficultyFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  difficultyFilterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  difficultyFilterChipInactive: {
    backgroundColor: '#E5E7EB',
    opacity: 0.5,
  },
  difficultyFilterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  difficultyFilterTextInactive: {
    color: '#6B7280',
  },
  rangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rangeInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  rangeSeparator: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});
