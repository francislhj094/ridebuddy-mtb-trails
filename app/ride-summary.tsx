import { Stack, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { CheckCircle, MapPin, Clock, TrendingUp, Gauge, Sparkles } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRides } from '@/contexts/RideContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function RideSummaryScreen() {
  const router = useRouter();
  const { rides } = useRides();
  const { convertDistance, convertSpeed, convertElevation, distanceUnit, speedUnit, elevationUnit } = useSettings();

  const scaleAnim = React.useState(() => new Animated.Value(0))[0];
  const fadeAnim = React.useState(() => new Animated.Value(0))[0];

  const lastRide = rides[rides.length - 1];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  if (!lastRide) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const handleDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.push('/(tabs)/activity');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Ride Complete',
        presentation: 'modal',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
      }} />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.successIcon, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.successIconCircle}>
            <LinearGradient
              colors={['#000000', '#1A1A1A']}
              style={styles.successIconGradient}
            >
              <CheckCircle size={80} color="#FFFFFF" fill="#FFFFFF" />
            </LinearGradient>
          </View>
        </Animated.View>
        
        <View style={styles.titleContainer}>
          <Sparkles size={24} color="#FBBF24" fill="#FBBF24" />
          <Text style={styles.title}>Great Ride!</Text>
          <Sparkles size={24} color="#FBBF24" fill="#FBBF24" />
        </View>
        <Text style={styles.subtitle}>Your ride has been saved</Text>

        <View style={styles.summaryCard}>
          <View style={styles.summaryCardGradient}>
            <View style={styles.mainStatRow}>
              <View style={styles.mainStatContainer}>
                <View style={styles.mainStatGradient}>
                  <MapPin size={32} color="#000000" />
                  <Text style={styles.mainStatValue}>
                    {convertDistance(lastRide.stats.distance).toFixed(2)}
                  </Text>
                  <Text style={styles.mainStatLabel}>{distanceUnit}</Text>
                </View>
              </View>

              <View style={styles.mainStatContainer}>
                <View style={styles.mainStatGradient}>
                  <Clock size={32} color="#3B82F6" />
                  <Text style={styles.mainStatValue}>
                    {formatDuration(lastRide.stats.duration)}
                  </Text>
                  <Text style={styles.mainStatLabel}>Duration</Text>
                </View>
              </View>
            </View>
            <View style={styles.secondaryStatsRow}>
              <View style={styles.secondaryStatItem}>
                <View style={styles.secondaryStatIcon}>
                  <TrendingUp size={24} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.secondaryStatValue}>
                    {convertElevation(lastRide.stats.elevationGain).toFixed(0)}
                  </Text>
                  <Text style={styles.secondaryStatLabel}>{elevationUnit} gain</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.secondaryStatItem}>
                <View style={styles.secondaryStatIcon}>
                  <Gauge size={24} color="#8B5CF6" />
                </View>
                <View>
                  <Text style={styles.secondaryStatValue}>
                    {convertSpeed(lastRide.stats.avgSpeed).toFixed(1)}
                  </Text>
                  <Text style={styles.secondaryStatLabel}>avg {speedUnit}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#000000', '#1A1A1A']}
            style={styles.doneButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIconCircle: {
    borderRadius: 80,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  successIconGradient: {
    padding: 20,
    borderRadius: 80,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 40,
  },
  summaryCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  summaryCardGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
  },
  mainStatRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  mainStatContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainStatGradient: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  mainStatValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000000',
    marginTop: 12,
    marginBottom: 4,
  },
  mainStatLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  secondaryStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  footer: {
    padding: 20,
  },
  doneButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  doneButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
