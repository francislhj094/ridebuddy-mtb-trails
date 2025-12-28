import { Stack } from 'expo-router';
import { Calendar, MapPin, Clock, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRides } from '@/contexts/RideContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function ActivityScreen() {
  const { rides } = useRides();
  const { convertDistance, convertElevation, distanceUnit, elevationUnit } = useSettings();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const sortedRides = [...rides].sort((a, b) => 
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
        <Text style={styles.headerSubtitle}>{rides.length} total rides</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Calendar size={64} color="#374151" />
            <Text style={styles.emptyTitle}>No rides yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your rides to see them here
            </Text>
          </View>
        ) : (
          sortedRides.map((ride) => (
            <View key={ride.id} style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <View>
                  <Text style={styles.rideDate}>{formatDate(ride.startTime)}</Text>
                  <Text style={styles.rideTime}>
                    {new Date(ride.startTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.miniStat}>
                  <MapPin size={18} color="#000000" />
                  <Text style={styles.miniStatValue}>
                    {convertDistance(ride.stats.distance).toFixed(2)}
                  </Text>
                  <Text style={styles.miniStatLabel}>{distanceUnit}</Text>
                </View>

                <View style={styles.miniStat}>
                  <Clock size={18} color="#3B82F6" />
                  <Text style={styles.miniStatValue}>
                    {formatDuration(ride.stats.duration)}
                  </Text>
                  <Text style={styles.miniStatLabel}>Time</Text>
                </View>

                <View style={styles.miniStat}>
                  <TrendingUp size={18} color="#F59E0B" />
                  <Text style={styles.miniStatValue}>
                    {convertElevation(ride.stats.elevationGain).toFixed(0)}
                  </Text>
                  <Text style={styles.miniStatLabel}>{elevationUnit}</Text>
                </View>
              </View>
            </View>
          ))
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  rideCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rideDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  rideTime: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
  },
  miniStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
