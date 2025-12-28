import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { AppSettings } from '@/types';

const SETTINGS_KEY = '@ridebuddy_settings';

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<AppSettings>({
    units: 'metric'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  };

  const convertDistance = (km: number) => {
    return settings.units === 'metric' ? km : km * 0.621371;
  };

  const convertSpeed = (kmh: number) => {
    return settings.units === 'metric' ? kmh : kmh * 0.621371;
  };

  const convertElevation = (meters: number) => {
    return settings.units === 'metric' ? meters : meters * 3.28084;
  };

  const distanceUnit = settings.units === 'metric' ? 'km' : 'mi';
  const speedUnit = settings.units === 'metric' ? 'km/h' : 'mph';
  const elevationUnit = settings.units === 'metric' ? 'm' : 'ft';

  return {
    settings,
    updateSettings,
    convertDistance,
    convertSpeed,
    convertElevation,
    distanceUnit,
    speedUnit,
    elevationUnit
  };
});
