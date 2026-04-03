import React, { useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const isDisabled = disabled || loading;

  const renderContent = () => (
    <View style={styles.content}>
      {loading && <ActivityIndicator color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : theme.colors.primary} style={styles.loader} />}
      {icon && !loading && <Text style={[styles.icon, variant === 'primary' || variant === 'secondary' ? styles.iconLight : styles.iconDark]}>{icon}</Text>}
      <Text style={[
        styles.text,
        textSizeStyles[size],
        variant === 'primary' && styles.textPrimary,
        variant === 'secondary' && styles.textSecondary,
        variant === 'outline' && styles.textOutline,
        variant === 'ghost' && styles.textGhost,
        isDisabled && styles.textDisabled,
      ]}>
        {title}
      </Text>
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, sizeStyles[size], isDisabled && styles.disabled]}
          >
            {renderContent()}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        <Animated.View style={animatedStyle}>
          <LinearGradient
            colors={[theme.colors.accent, theme.colors.accentLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.button, sizeStyles[size], isDisabled && styles.disabled]}
          >
            {renderContent()}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
    >
      <Animated.View style={[
        styles.button,
        sizeStyles[size],
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        animatedStyle,
        isDisabled && styles.disabled,
      ]}>
        {renderContent()}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: theme.borderRadius.m,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  small: {
    height: 40,
    paddingHorizontal: theme.spacing.m,
    minWidth: 44,
  },
  medium: {
    height: 48,
    paddingHorizontal: theme.spacing.l,
    minWidth: 44,
  },
  large: {
    height: 56,
    paddingHorizontal: theme.spacing.xl,
    minWidth: 44,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loader: {
    marginRight: theme.spacing.s,
  },
  icon: {
    marginRight: theme.spacing.s,
    fontSize: 18,
  },
  iconLight: {
    color: '#FFFFFF',
  },
  iconDark: {
    color: theme.colors.primary,
  },
  text: {
    fontWeight: '700',
  },
  textSmall: {
    fontSize: 14,
  },
  textMedium: {
    fontSize: 16,
  },
  textLarge: {
    fontSize: 18,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: theme.colors.primary,
  },
  textGhost: {
    color: theme.colors.primary,
  },
  textDisabled: {
    opacity: 0.7,
  },
});
