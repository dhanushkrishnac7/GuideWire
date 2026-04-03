import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { usePayouts } from '../contexts/PayoutContext';

interface GlobalPayoutBannerProps {
  onPress?: () => void;
}

export const GlobalPayoutBanner: React.FC<GlobalPayoutBannerProps> = ({ onPress }) => {
  const { totalPayouts, recentPayouts } = usePayouts();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (totalPayouts === 0) return null;

  const latestPayout = recentPayouts[0];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: pulseAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="wallet" size={16} color="#FFF" />
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>TOTAL PAYOUTS</Text>
          <Text style={styles.amount}>₹{totalPayouts.toLocaleString()}</Text>
        </View>
        {latestPayout && (
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 14,
    ...theme.shadows.card,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  amount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
});
