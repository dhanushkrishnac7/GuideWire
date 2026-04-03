import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface PayoutNotificationToastProps {
  visible: boolean;
  stage: 'detecting' | 'verifying' | 'processing' | 'success';
  triggerType: 'rain' | 'heat' | 'traffic';
  amount: number;
  onComplete?: () => void;
}

export const PayoutNotificationToast: React.FC<PayoutNotificationToastProps> = ({
  visible,
  stage,
  triggerType,
  amount,
  onComplete,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after stage completes
      if (stage === 'success') {
        setTimeout(() => {
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: -100,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onComplete?.();
          });
        }, 3000);
      }
    }
  }, [visible, stage]);

  const getStageConfig = () => {
    switch (stage) {
      case 'detecting':
        return {
          icon: 'scan' as const,
          title: 'Trigger Detected',
          message: `${getTriggerName(triggerType)} condition detected in your zone`,
          color: '#FFCC00',
          bgColor: '#FFCC0020',
        };
      case 'verifying':
        return {
          icon: 'shield-checkmark' as const,
          title: 'Verifying Eligibility',
          message: 'Checking online status and location...',
          color: '#4DACFF',
          bgColor: '#4DACFF20',
        };
      case 'processing':
        return {
          icon: 'card' as const,
          title: 'Processing Payout',
          message: `Sending ₹${amount} to your UPI account...`,
          color: '#9B6DFF',
          bgColor: '#9B6DFF20',
        };
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          title: 'Payment Received!',
          message: `₹${amount} credited to your account`,
          color: '#4CD964',
          bgColor: '#4CD96420',
        };
    }
  };

  const getTriggerName = (type: string) => {
    switch (type) {
      case 'rain': return 'Heavy Rain';
      case 'heat': return 'Extreme Heat';
      case 'traffic': return 'Traffic Gridlock';
      default: return 'Trigger';
    }
  };

  if (!visible) return null;

  const config = getStageConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
          backgroundColor: config.bgColor,
          borderLeftColor: config.color,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: config.color }]}>
        <Ionicons name={config.icon} size={24} color="#FFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.message}>{config.message}</Text>
      </View>
      {stage !== 'success' && (
        <View style={styles.spinner}>
          <Ionicons name="hourglass" size={16} color={config.color} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    ...theme.shadows.cardHover,
    zIndex: 9999,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  message: {
    fontSize: 12,
    color: theme.colors.textSub,
    lineHeight: 16,
  },
  spinner: {
    marginLeft: 8,
  },
});
