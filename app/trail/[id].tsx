import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { MapPin, TrendingUp, Star, Navigation, Bookmark, AlertCircle } from 'lucide-react-native';
import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TRAILS, getDifficultyColor, getConditionColor } from '@/constants/trails';
import { useRides } from '@/contexts/RideContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_WIDTH = SCREEN_WIDTH - 40;

export default function TrailDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { startRide } = useRides();
  const { convertDistance, convertElevation, distanceUnit, elevationUnit } = useSettings();
  const { toggleBookmark, isBookmarked } = useBookmarks();
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<number>(0);
  const [trail, setTrail] = useState(() => TRAILS.find(t => t.id === id));

  const loadTrailRatings = useCallback(async () => {
    const foundTrail = TRAILS.find(t => t.id === id);
    if (!foundTrail || !user) return;

    try {
      const ratingsKey = `@trail_ratings_${id}`;
      const stored = await AsyncStorage.getItem(ratingsKey);
      if (stored) {
        const ratings = JSON.parse(stored);
        const updatedTrail = { ...foundTrail, userRatings: ratings };
        setTrail(updatedTrail);
        if (user && ratings[user.id]) {
          setUserRating(ratings[user.id]);
        }
      } else {
        setTrail(foundTrail);
      }
    } catch (error) {
      console.error('Failed to load ratings:', error);
      setTrail(foundTrail);
    }
  }, [id, user]);

  React.useEffect(() => {
    loadTrailRatings();
  }, [loadTrailRatings]);

  const submitRating = async (rating: number) => {
    if (!user || !trail) return;

    try {
      const ratingsKey = `@trail_ratings_${id}`;
      const stored = await AsyncStorage.getItem(ratingsKey);
      const ratings = stored ? JSON.parse(stored) : {};
      ratings[user.id] = rating;
      await AsyncStorage.setItem(ratingsKey, JSON.stringify(ratings));

      const ratingValues = Object.values(ratings) as number[];
      const avgRating = ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length;
      const updatedTrail = {
        ...trail,
        rating: avgRating,
        ratingCount: ratingValues.length,
        userRatings: ratings
      };
      setTrail(updatedTrail);
      setUserRating(rating);
    } catch (error) {
      console.error('Failed to save rating:', error);
    }
  };

  if (!trail) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Trail not found</Text>
      </SafeAreaView>
    );
  }

  const difficultyColor = getDifficultyColor(trail.difficulty);
  const conditionColor = getConditionColor(trail.condition);
  const bookmarked = isBookmarked(trail.id);

  const handleNavigate = async () => {
    await startRide(trail.id);
    router.push('/(tabs)/ride');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: trail.name,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => toggleBookmark(trail.id)}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Bookmark 
              size={24} 
              color="#000000" 
              fill={bookmarked ? '#000000' : 'transparent'}
            />
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={trail.photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${trail.id}-photo-${index}`}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item }}
              style={styles.heroImage}
              contentFit="cover"
            />
          )}
          snapToInterval={PHOTO_WIDTH + 40}
          decelerationRate="fast"
          contentContainerStyle={styles.photoGallery}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
                <Text style={styles.difficultyText}>
                  {trail.difficulty}
                </Text>
              </View>
              <View style={[styles.conditionBadge, { backgroundColor: conditionColor }]}>
                <AlertCircle size={14} color="#FFFFFF" />
                <Text style={styles.conditionText}>{trail.condition}</Text>
              </View>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={18} color="#FBBF24" fill="#FBBF24" />
              <Text style={styles.ratingText}>{trail.rating.toFixed(1)}</Text>
              <Text style={styles.ratingCount}>({trail.ratingCount})</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MapPin size={28} color="#000000" />
              <Text style={styles.statValue}>
                {convertDistance(trail.distance).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Distance ({distanceUnit})</Text>
            </View>

            <View style={styles.statCard}>
              <TrendingUp size={28} color="#F59E0B" />
              <Text style={styles.statValue}>
                {convertElevation(trail.elevationGain).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Elevation ({elevationUnit})</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this trail</Text>
            <Text style={styles.description}>{trail.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rate this trail</Text>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => submitRating(star)}
                  activeOpacity={0.7}
                >
                  <Star
                    size={36}
                    color="#FBBF24"
                    fill={star <= userRating ? '#FBBF24' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {userRating > 0 && (
              <Text style={styles.ratingFeedback}>You rated this trail {userRating} stars</Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.navigateButton}
          onPress={handleNavigate}
          activeOpacity={0.8}
        >
          <Navigation size={24} color="#FFFFFF" />
          <Text style={styles.navigateButtonText}>Start Ride</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  photoGallery: {
    paddingHorizontal: 0,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 300,
  },
  headerButton: {
    marginRight: 8,
    padding: 4,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    flexWrap: 'wrap',
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  conditionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  conditionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  difficultyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FBBF24',
  },
  ratingCount: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
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
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  ratingFeedback: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navigateButton: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  navigateButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 40,
  },
});
