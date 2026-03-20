import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView,
  ActivityIndicator, Animated, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { theme } from '../theme';

interface Props {
  onConfirmLocation: () => void;
}

export default function LocationScreen({ onConfirmLocation }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    // Pulse animation for the pin
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission was denied. Please enable it in settings to continue.');
          setLoading(false);
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(loc);

        // Reverse geocode
        try {
          const geocode = await Location.reverseGeocodeAsync({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          if (geocode.length > 0) {
            const g = geocode[0];
            const parts = [g.name, g.street, g.city, g.region, g.postalCode, g.country].filter(Boolean);
            setAddress(parts.join(', '));
          }
        } catch {
          setAddress(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        }
      } catch (err) {
        setErrorMsg('Unable to get your location. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);



  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3A1CD9', '#6B42FF']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={[styles.decorCircle, { top: -15, right: -15, width: 80, height: 80 }]} />
        <View style={styles.headerContent}>
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, styles.stepDone]} />
            <View style={[styles.stepLine, styles.stepLineDone]} />
            <View style={[styles.stepDot, styles.stepActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
            <Text style={styles.stepLabel}>Step 2 of 3</Text>
          </View>
          <Text style={styles.headerTitle}>📍 Your Location</Text>
          <Text style={styles.headerSub}>We need your location for weather-based coverage</Text>
        </View>
      </LinearGradient>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Fetching your location...</Text>
            <Text style={styles.loadingSubtext}>This may take a moment</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconCircle}>
              <Ionicons name="location-outline" size={40} color="#FF3B5C" />
            </View>
            <Text style={styles.errorTitle}>Location Access Needed</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => { setLoading(true); setErrorMsg(''); }}
            >
              <Ionicons name="refresh" size={18} color={theme.colors.primary} />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Map Preview */}
            <View style={styles.mapContainer}>
              {Platform.OS === 'web' && location ? (
                <iframe
                  src={`https://maps.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}&z=15&output=embed`}
                  style={{ width: '100%', height: '100%', border: 'none', borderRadius: 20 } as any}
                  title="map"
                />
              ) : (
                <View style={styles.mapFallback}>
                  <Animated.View style={[styles.pinCircleOuter, { transform: [{ scale: pulseAnim }] }]}>
                    <View style={styles.pinCircleInner}>
                      <Ionicons name="location" size={32} color="#FFF" />
                    </View>
                  </Animated.View>
                  <Text style={styles.coordsText}>
                    {location?.coords.latitude.toFixed(4)}, {location?.coords.longitude.toFixed(4)}
                  </Text>
                </View>
              )}
            </View>

            {/* Address Card */}
            <View style={styles.addressCard}>
              <View style={styles.addressIconRow}>
                <View style={styles.addressIconCircle}>
                  <MaterialCommunityIcons name="map-marker-check" size={22} color={theme.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressLabel}>Detected Location</Text>
                  <Text style={styles.addressText}>{address || 'Location detected'}</Text>
                </View>
              </View>
            </View>

            {/* Info Pill */}
            <View style={styles.infoPill}>
              <Ionicons name="shield-checkmark" size={16} color="#4CD964" />
              <Text style={styles.infoPillText}>Your location is used only for weather-based coverage</Text>
            </View>
          </>
        )}
      </Animated.View>

      {/* Bottom Button */}
      {!loading && !errorMsg && (
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={onConfirmLocation} activeOpacity={0.85}>
            <LinearGradient
              colors={['#4B28E5', '#6B42FF']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.confirmBtn}
            >
              <Text style={styles.confirmBtnText}>Confirm Location</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  decorCircle: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)' },

  header: {
    paddingTop: 50, paddingBottom: 28, paddingHorizontal: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden',
  },
  headerContent: { zIndex: 1 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFF', marginBottom: 6 },
  headerSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.3)' },
  stepActive: { backgroundColor: '#FFF', width: 12, height: 12, borderRadius: 6 },
  stepDone: { backgroundColor: '#4CD964', width: 12, height: 12, borderRadius: 6 },
  stepLine: { width: 32, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#4CD964' },
  stepLabel: { marginLeft: 'auto', fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, fontWeight: '600', color: theme.colors.textMain, marginTop: 16 },
  loadingSubtext: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },

  // Error
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  errorIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#FFF0F3', justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  errorTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.textMain, marginBottom: 8 },
  errorText: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0EDFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
  },
  retryText: { fontSize: 14, fontWeight: '600', color: theme.colors.primary, marginLeft: 8 },

  // Map
  mapContainer: {
    height: 220, borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#E8EAED', marginBottom: 16,
  },
  mapFallback: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#EDE9FF',
  },
  pinCircleOuter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(75, 40, 229, 0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  pinCircleInner: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  coordsText: { fontSize: 13, fontWeight: '600', color: theme.colors.textMuted, marginTop: 12 },

  // Address Card
  addressCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 10, elevation: 3,
    marginBottom: 16,
  },
  addressIconRow: { flexDirection: 'row', alignItems: 'center' },
  addressIconCircle: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: '#F0EDFF', justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  addressLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 3 },
  addressText: { fontSize: 14, fontWeight: '600', color: theme.colors.textMain, lineHeight: 20 },

  // Info pill
  infoPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EDFFF2', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12,
  },
  infoPillText: { fontSize: 12, fontWeight: '500', color: '#108010', marginLeft: 8, flex: 1 },

  // Bottom
  bottomBar: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 12 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    height: 54, borderRadius: 16,
  },
  confirmBtnText: { color: '#FFF', fontSize: 17, fontWeight: '700', marginRight: 8 },
});
