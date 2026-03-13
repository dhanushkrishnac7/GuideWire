import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

interface GradientCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
}

export const GradientCard: React.FC<GradientCardProps> = ({ children, style }) => {
    return (
        <LinearGradient
            colors={[theme.colors.cardGradientStart, theme.colors.cardGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.card, style]}
        >
            {children}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        overflow: 'hidden',
        // Example default styling, expand as necessary
    },
});
