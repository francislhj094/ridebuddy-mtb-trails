import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { User as UserIcon, MapPin, TrendingUp, Calendar, Settings, Bookmark, Star, Award } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useRides } from '@/contexts/RideContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useBookmarks } from '@/contexts/BookmarksContext';
import { useAchievements } from '@/contexts/AchievementsContext';
import { TRAILS, getDifficultyColor } from '@/constants/trails';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { rides } = useRides();
  const { convertDistance, convertElevation, distanceUnit, elevationUnit } = useSettings();
  const { bookmarkedTrailIds } = useBookmarks();
  const { achievements, progress, unlockedCount } = useAchievements();

  const totalDistance = rides.reduce((sum, ride) => sum + ride.stats.distance, 0);
  const totalElevation = rides.reduce((sum, ride) => sum + ride.stats.elevationGain, 0);
  const totalRides = rides.length;

  const bookmarkedTrails = TRAILS.filter(trail => bookmarkedTrailIds.includes(trail.id));

  const formatProgress = (achievementId: string) => {
    const prog = progress.find(p => p.achievementId === achievementId);
    if (!prog) return '';

    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement) return '';

    switch (achievement.requirement.type) {
      case 'rides':
        return `${prog.current}/${prog.target} rides`;
      case 'distance':
        return `${convertDistance(prog.current).toFixed(1)}/${convertDistance(prog.target).toFixed(1)} ${distanceUnit}`;
      case 'elevation':
        return `${convertElevation(prog.current).toFixed(0)}/${convertElevation(prog.target).toFixed(0)} ${elevationUnit}`;
      case 'trails':
        return `${prog.current}/${prog.target} trails`;
      case 'streak':
        return `${prog.current}/${prog.target} days`;
      case 'speed':
        const speedUnit = distanceUnit === 'mi' ? 'mph' : 'km/h';
        const current = distanceUnit === 'mi' ? prog.current * 2.23694 : prog.current * 3.6;
        const target = distanceUnit === 'mi' ? prog.target * 2.23694 : prog.target * 3.6;
        return `${current.toFixed(1)}/${target.toFixed(1)} ${speedUnit}`;
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity 
          onPress={() => router.push('/settings')}
          style={styles.settingsButton}
          activeOpacity={0.7}
        >
          <Settings size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <UserIcon size={48} color="#22C55E" />
          </View>
          <Text style={styles.userName}>{user?.name || 'Rider'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Lifetime Stats</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Calendar size={28} color="#22C55E" />
              </View>
              <Text style={styles.statValue}>{totalRides}</Text>
              <Text style={styles.statLabel}>Total Rides</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MapPin size={28} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>
                {convertDistance(totalDistance).toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>{distanceUnit}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={28} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>
                {convertElevation(totalElevation).toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>{elevationUnit}</Text>
            </View>
          </View>
        </View>

        <View style={styles.achievementsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <View style={styles.unlockedBadge}>
              <Award size={16} color="#22C55E" />
              <Text style={styles.unlockedText}>
                {unlockedCount}/{achievements.length}
              </Text>
            </View>
          </View>

          {achievements.map((achievement) => {
            const prog = progress.find(p => p.achievementId === achievement.id);
            const progressPercent = prog ? (prog.current / prog.target) * 100 : 0;

            return (
              <View key={achievement.id} style={styles.achievementCard}>
                <View style={styles.achievementIconContainer}>
                  <View style={[
                    styles.achievementIconCircle,
                    achievement.unlockedAt && styles.achievementIconUnlocked
                  ]}>
                    <Image
                      source={{ uri: achievement.icon }}
                      style={styles.achievementIcon}
                      contentFit="cover"
                    />
                    {achievement.unlockedAt && (
                      <View style={styles.achievementIconOverlay}>
                        <Award size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.achievementContent}>
                  <View style={styles.achievementHeader}>
                    <Text style={[
                      styles.achievementTitle,
                      achievement.unlockedAt && styles.achievementTitleUnlocked
                    ]}>
                      {achievement.title}
                    </Text>
                    {achievement.unlockedAt && (
                      <View style={styles.checkMark}>
                        <Text style={styles.checkMarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>

                  {!achievement.unlockedAt && prog && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${Math.min(progressPercent, 100)}%` }
                          ]}
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {formatProgress(achievement.id)}
                      </Text>
                    </View>
                  )}

                  {achievement.unlockedAt && (
                    <Text style={styles.unlockedDate}>
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {bookmarkedTrails.length > 0 && (
          <View style={styles.bookmarksSection}>
            <Text style={styles.sectionTitle}>Bookmarked Trails</Text>
            {bookmarkedTrails.map(trail => {
              const difficultyColor = getDifficultyColor(trail.difficulty);
              return (
                <TouchableOpacity
                  key={trail.id}
                  style={styles.bookmarkCard}
                  onPress={() => router.push(`/trail/${trail.id}`)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: trail.image }}
                    style={styles.bookmarkImage}
                    contentFit="cover"
                  />
                  <View style={styles.bookmarkInfo}>
                    <Text style={styles.bookmarkName} numberOfLines={1}>
                      {trail.name}
                    </Text>
                    <View style={[styles.bookmarkDifficulty, { backgroundColor: difficultyColor }]}>
                      <Text style={styles.bookmarkDifficultyText}>{trail.difficulty}</Text>
                    </View>
                    <View style={styles.bookmarkStats}>
                      <View style={styles.bookmarkStat}>
                        <MapPin size={14} color="#9CA3AF" />
                        <Text style={styles.bookmarkStatText}>
                          {convertDistance(trail.distance).toFixed(1)} {distanceUnit}
                        </Text>
                      </View>
                      <View style={styles.bookmarkStat}>
                        <Star size={14} color="#FBBF24" fill="#FBBF24" />
                        <Text style={styles.bookmarkStatText}>{trail.rating.toFixed(1)}</Text>
                      </View>
                    </View>
                  </View>
                  <Bookmark size={20} color="#22C55E" fill="#22C55E" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
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
    color: '#FFFFFF',
  },
  settingsButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#22C55E',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statIcon: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  achievementsSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  unlockedText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#22C55E',
  },
  achievementCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#374151',
  },
  achievementIconContainer: {
    marginRight: 16,
  },
  achievementIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#374151',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  achievementIconUnlocked: {
    borderColor: '#22C55E',
    borderWidth: 3,
  },
  achievementIcon: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  achievementIconOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  achievementTitleUnlocked: {
    color: '#FFFFFF',
  },
  checkMark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  achievementDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  unlockedDate: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  bookmarksSection: {
    marginBottom: 32,
  },
  bookmarkCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    gap: 12,
  },
  bookmarkImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  bookmarkInfo: {
    flex: 1,
    gap: 6,
  },
  bookmarkName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookmarkDifficulty: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookmarkDifficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookmarkStats: {
    flexDirection: 'row',
    gap: 16,
  },
  bookmarkStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookmarkStatText: {
    fontSize: 12,
    color: '#D1D5DB',
    fontWeight: '500',
  },
});
