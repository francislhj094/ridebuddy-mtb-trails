import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Award, X } from 'lucide-react-native';
import { Achievement } from '@/types';

interface BadgeUnlockedModalProps {
  achievement: Achievement | null;
  visible: boolean;
  onDismiss: () => void;
}

export default function BadgeUnlockedModal({ achievement, visible, onDismiss }: BadgeUnlockedModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);

      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible, scaleAnim, rotateAnim]);

  if (!achievement) return null;

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>

          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [{ scale: scaleAnim }, { rotate }]
              }
            ]}
          >
            <View style={styles.badgeGlow}>
              <View style={styles.badgeCircle}>
                <Image
                  source={{ uri: achievement.icon }}
                  style={styles.badgeImage}
                  contentFit="cover"
                />
                <View style={styles.badgeOverlay}>
                  <Award size={48} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </Animated.View>

          <Text style={styles.title}>Achievement Unlocked!</Text>
          <Text style={styles.achievementTitle}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={onDismiss}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Awesome!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#1F2937',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badgeContainer: {
    marginBottom: 24,
  },
  badgeGlow: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#22C55E',
    opacity: 0.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#22C55E',
    overflow: 'hidden',
  },
  badgeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  badgeOverlay: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(34, 197, 94, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#22C55E',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
});
