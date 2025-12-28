import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useEffect, useState } from 'react';
import { User } from '@/types';
import { trpc } from '@/lib/trpc';

const AUTH_KEY = '@ridebuddy_user';
const TOKEN_KEY = '@ridebuddy_token';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signUpMutation = trpc.users.signUp.useMutation();
  const signInMutation = trpc.users.signIn.useMutation();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const result = await signUpMutation.mutateAsync({ email, password, name });
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(result.user));
      await AsyncStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation.mutateAsync({ email, password });
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(result.user));
      await AsyncStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return {
    user,
    isLoading: isLoading || signUpMutation.isPending || signInMutation.isPending,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
});
