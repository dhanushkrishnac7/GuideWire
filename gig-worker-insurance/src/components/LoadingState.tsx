import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { theme } from '../theme';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton';
  skeletonType?: 'card' | 'list' | 'text';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'spinner',
  skeletonType = 'card',
  count = 3,
}) => {
  if (variant === 'spinner') {
    return (
      <View style={styles.spinnerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} type={skeletonType} />
      ))}
    </View>
  );
};

interface SkeletonItemProps {
  type: 'card' | 'list' | 'text';
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({ type }) => {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (type === 'card') {
    return (
      <View style={styles.skeletonCard}>
        <Animated.View style={[styles.skeletonTitle, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonSubtitle, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.skeletonContent, { opacity: pulseAnim }]} />
      </View>
    );
  }

  if (type === 'list') {
    return (
      <View style={styles.skeletonListItem}>
        <Animated.View style={[styles.skeletonCircle, { opacity: pulseAnim }]} />
        <View style={styles.skeletonListContent}>
          <Animated.View style={[styles.skeletonListTitle, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.skeletonListSubtitle, { opacity: pulseAnim }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.skeletonTextContainer}>
      <Animated.View style={[styles.skeletonTextLine, { opacity: pulseAnim }]} />
      <Animated.View style={[styles.skeletonTextLine, { opacity: pulseAnim, width: '80%' }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  spinnerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  skeletonContainer: {
    gap: theme.spacing.m,
  },
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    ...theme.shadows.card,
  },
  skeletonTitle: {
    height: 20,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.s,
    width: '60%',
  },
  skeletonSubtitle: {
    height: 14,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.m,
    width: '40%',
  },
  skeletonContent: {
    height: 60,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    ...theme.shadows.card,
  },
  skeletonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border,
    marginRight: theme.spacing.m,
  },
  skeletonListContent: {
    flex: 1,
  },
  skeletonListTitle: {
    height: 16,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    marginBottom: theme.spacing.s,
    width: '70%',
  },
  skeletonListSubtitle: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    width: '50%',
  },
  skeletonTextContainer: {
    gap: theme.spacing.s,
  },
  skeletonTextLine: {
    height: 14,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    width: '100%',
  },
});
