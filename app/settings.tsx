import { Stack, useRouter } from 'expo-router';
import { LogOut, Globe, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut, deleteAccount, isDeletingAccount } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth');
  };

  const toggleUnits = () => {
    updateSettings({
      units: settings.units === 'metric' ? 'imperial' : 'metric'
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDeleteAccount,
        },
      ],
      { cancelable: true }
    );
  };

  const confirmDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount();
      router.replace('/auth');
    } catch (error) {
      console.error('Failed to delete account:', error);
      Alert.alert(
        'Error',
        'Failed to delete your account. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ 
        headerShown: true, 
        title: 'Settings',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
        headerShadowVisible: false,
      }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <TouchableOpacity
            style={styles.settingCard}
            onPress={toggleUnits}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={styles.settingIcon}>
                <Globe size={24} color="#3B82F6" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Units</Text>
                <Text style={styles.settingDescription}>
                  Distance and speed measurements
                </Text>
              </View>
            </View>
            <Text style={styles.settingValue}>
              {settings.units === 'metric' ? 'Metric (km)' : 'Imperial (mi)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity
            style={styles.settingCard}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, styles.warningIcon]}>
                <LogOut size={24} color="#F59E0B" />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Sign Out</Text>
                <Text style={styles.settingDescription}>
                  Log out of your account
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingCard, styles.deleteCard]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            disabled={isDeleting || isDeletingAccount}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, styles.dangerIcon]}>
                {(isDeleting || isDeletingAccount) ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Trash2 size={24} color="#EF4444" />
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, styles.dangerText]}>Delete Account</Text>
                <Text style={styles.settingDescription}>
                  Permanently delete your account and all data
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>RideBuddy v1.0.0</Text>
      </ScrollView>
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
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  settingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  warningIcon: {
    backgroundColor: '#F59E0B20',
  },
  dangerIcon: {
    backgroundColor: '#EF444420',
  },
  deleteCard: {
    marginTop: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  settingDescription: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
  },
  version: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});
