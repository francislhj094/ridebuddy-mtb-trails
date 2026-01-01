import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as Location from "expo-location";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider } from "@/contexts/AuthContext";
import { RideProvider } from "@/contexts/RideContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { BookmarksProvider } from "@/contexts/BookmarksContext";
import { AchievementsProvider, useAchievements } from "@/contexts/AchievementsContext";
import BadgeUnlockedModal from "@/components/BadgeUnlockedModal";
import { trpc, trpcClient } from "@/lib/trpc";
import { TrailsProvider } from "@/contexts/TrailsContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { newlyUnlockedAchievement, dismissNotification } = useAchievements();

  return (
    <>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="trail/[id]" options={{ headerShown: true, title: "Trail Details" }} />
        <Stack.Screen name="ride-summary" options={{ headerShown: true, title: "Ride Complete", presentation: "modal" }} />
      </Stack>
      <BadgeUnlockedModal
        achievement={newlyUnlockedAchievement}
        visible={!!newlyUnlockedAchievement}
        onDismiss={dismissNotification}
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        if (Platform.OS !== 'web') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status === 'granted') {
            console.log('Location permissions granted');
          } else {
            console.log('Location permissions denied');
          }
        }
      } catch (error) {
        console.error('Failed to request location permissions:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };
    
    requestPermissions();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <TrailsProvider>
              <RideProvider>
                <BookmarksProvider>
                  <AchievementsProvider>
                    <GestureHandlerRootView style={{ flex: 1 }}>
                      <RootLayoutNav />
                    </GestureHandlerRootView>
                  </AchievementsProvider>
                </BookmarksProvider>
              </RideProvider>
            </TrailsProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
