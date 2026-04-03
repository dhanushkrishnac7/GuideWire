import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Animated, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { fetchWeatherByCity, evaluateTriggers, WeatherData, TriggerStatus } from '../services/weatherService';
import { usePayouts } from '../contexts/PayoutContext';

interface Props {
  zone: string;
  fleet: string;
  plan: string;
  onNavigate: (screen: string) => void;
}

const WEEK_NUMBER = 42;

export default function HomeScreen({ zone, fleet, plan, onNavigate }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Real context for payouts
  const { totalPayouts, recentPayouts, activeTriggers } = usePayouts();

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    fetchWeatherByCity(zone).then(w => {
      setWeather(w);
      setLoading(false);
    });
  }, [zone]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar matching Figma */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => onNavigate('Profile')}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.locationWrap}>
            <Text style={styles.locationCity}>BENGALURU SOUTH</Text>
            <Text style={styles.locationZone}>{zone.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.protectedPill}>
          <Ionicons name="checkmark-circle" size={14} color={theme.colors.primary} />
          <Text style={styles.protectedText}>PROTECTED</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Active Coverage Card (White/Orange bar) */}
        <View style={styles.coverageCard}>
          <Text style={styles.coverageLabel}>ACTIVE COVERAGE</Text>
          <Text style={styles.coverageWeek}>Week {WEEK_NUMBER}</Text>
          <View style={styles.coverageFooter}>
            <View>
              <Text style={styles.coverageSubLabel}>Protection Level</Text>
              <Text style={styles.coveragePlanText}>Platinum Plus</Text>
            </View>
            <View style={styles.coverageAlignRight}>
              <Text style={styles.coverageSubLabel}>EXPIRES IN</Text>
              <Text style={styles.coverageExpiresText}>3d 14h</Text>
            </View>
          </View>
        </View>

        {/* Total Protected Income Card (Navy Blue) */}
        <View style={styles.incomeCard}>
          <Text style={styles.incomeLabel}>TOTAL PROTECTED INCOME</Text>
          <View style={styles.incomeAmountRow}>
            <Text style={styles.incomeCurrency}>₹</Text>
            <Text style={styles.incomeAmount}>1,200</Text>
            <Text style={styles.incomeDecimal}>.00</Text>
          </View>
          <View style={styles.incomeFooter}>
            <Text style={styles.incomeEstimate}>Estimated based on triggers</Text>
            <TouchableOpacity style={styles.insightsBtn} onPress={() => onNavigate('Analytics')}>
              <Text style={styles.insightsBtnText}>INSIGHTS</Text>
              <Ionicons name="analytics" size={14} color="#FFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Safety Triggers Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>AI SAFETY TRIGGERS</Text>
          <View style={styles.realTimeBadge}>
            <Text style={styles.realTimeText}>REAL-TIME</Text>
          </View>
        </View>

        {/* Triggers */}
        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ marginVertical: 20 }} />
          ) : activeTriggers.length === 0 ? (
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={[styles.triggerCard, { paddingVertical: 32, justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="checkmark-circle" size={32} color="#E0E2EA" style={{ marginBottom: 12 }} />
                <Text style={{ fontSize: 13, color: theme.colors.textMuted, fontWeight: '600' }}>Environment Stable</Text>
                <Text style={{ fontSize: 11, color: theme.colors.textSub }}>No safety triggers active in your zone.</Text>
              </View>
            </Animated.View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {activeTriggers.map((t) => (
                <View key={t.id} style={styles.triggerCard}>
                  <View style={[styles.triggerIconBox, { backgroundColor: t.color }]}>
                    <Ionicons name={t.icon as any} size={28} color="#FFF" />
                  </View>
                  <View style={styles.triggerBody}>
                    <View style={styles.triggerTitleRow}>
                      <Text style={styles.triggerLabel}>{t.label}</Text>
                      <Text style={styles.triggerStatusActiveText}>TRIGGER ACTIVE</Text>
                    </View>
                    <Text style={styles.triggerSub}>{t.sub}</Text>
                    <Text style={[styles.triggerMultiplierText, { color: t.color }]}>PAYOUT ACTIVE: ₹{t.payout}</Text>
                  </View>
                </View>
              ))}
            </Animated.View>
          )}
        </View>

        {/* Recent Automatic Payouts */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>RECENT AUTOMATIC PAYOUTS</Text>
        </View>
        <View style={styles.section}>
          {recentPayouts.length === 0 ? (
            <View style={styles.noPayoutCard}>
              <Text style={{ fontSize: 13, color: theme.colors.textMuted }}>No payouts issued yet.</Text>
            </View>
          ) : (
            recentPayouts.map(p => {
              const typeColor = p.type === 'rain' ? '#1A1B4B' : p.type === 'heat' ? '#FF7A45' : p.type === 'flood' ? '#E8472A' : p.type === 'aqi' ? '#A06000' : '#9B6DFF';
              const typeIcon = p.type === 'rain' ? 'rainy' : p.type === 'heat' ? 'sunny' : p.type === 'flood' ? 'water' : p.type === 'aqi' ? 'cloud' : 'warning';
              return (
                <TouchableOpacity key={p.id} style={styles.payoutRow} onPress={() => onNavigate('Claims')}>
                  <View style={[styles.payoutIcon, { backgroundColor: '#F5F5F7' }]}>
                    <Ionicons name={typeIcon as any} size={20} color={typeColor} />
                  </View>
                  <View style={styles.payoutBody}>
                    <Text style={styles.payoutLabel}>₹{p.amount} Payout - {p.label}</Text>
                    <Text style={styles.payoutTime}>Just Now • Automatic Approval</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F5F5F7'
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FF7A45', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#FFF'
  },
  locationWrap: { justifyContent: 'center' },
  locationCity: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5 },
  locationZone: { fontSize: 18, fontWeight: '900', color: theme.colors.primary, marginTop: 2 },
  protectedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8EEFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  protectedText: { fontSize: 11, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 },

  scroll: { paddingTop: 10, paddingBottom: 20 },

  // Active Coverage Card
  coverageCard: {
    marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 16,
    borderLeftWidth: 4, borderLeftColor: '#FF7A45', padding: 20, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  coverageLabel: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  coverageWeek: { fontSize: 32, fontWeight: '900', color: theme.colors.primary, fontStyle: 'italic', marginBottom: 20 },
  coverageFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  coverageSubLabel: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  coveragePlanText: { fontSize: 16, fontWeight: '700', color: '#B87A00' },
  coverageAlignRight: { alignItems: 'flex-end' },
  coverageExpiresText: { fontSize: 14, fontWeight: '700', color: theme.colors.textMain },

  // Total Protected Income Card
  incomeCard: {
    marginHorizontal: 16, backgroundColor: theme.colors.primary, borderRadius: 16,
    padding: 24, paddingBottom: 20, marginBottom: 24,
    shadowColor: '#1A1B4B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  incomeLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginBottom: 10 },
  incomeAmountRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 20 },
  incomeCurrency: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 6, marginRight: 4 },
  incomeAmount: { fontSize: 48, fontWeight: '900', color: '#FFF', lineHeight: 54 },
  incomeDecimal: { fontSize: 24, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  incomeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  incomeEstimate: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  insightsBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
  },
  insightsBtnText: { fontSize: 11, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },

  // Common Sections
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 },
  realTimeBadge: { backgroundColor: '#FFCC00', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  realTimeText: { fontSize: 10, fontWeight: '800', color: '#A06000' },
  section: { marginHorizontal: 16, marginBottom: 24 },

  // Trigger Cards
  triggerCard: {
    flexDirection: 'row', backgroundColor: '#FFF',
    borderRadius: 16, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  triggerIconBox: { width: 56, height: 56, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  triggerBody: { flex: 1, justifyContent: 'center' },
  triggerTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  triggerLabel: { fontSize: 16, fontWeight: '800', color: theme.colors.textMain },
  triggerLabelGray: { fontSize: 16, fontWeight: '800', color: theme.colors.textSub },
  triggerStatusActiveText: { fontSize: 10, fontWeight: '800', color: '#E8472A' },
  triggerStatusPendingText: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted },
  triggerSub: { fontSize: 12, color: theme.colors.textSub, lineHeight: 18, marginBottom: 6 },
  triggerSubGray: { fontSize: 10, fontWeight: '600', color: theme.colors.textMuted, letterSpacing: 0.5 },
  triggerMultiplierText: { fontSize: 11, fontWeight: '800', color: '#FF7A45' },

  // Payout Rows
  payoutRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF',
    padding: 16, borderRadius: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  payoutIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  payoutBody: { flex: 1 },
  payoutLabel: { fontSize: 14, fontWeight: '800', color: theme.colors.primary, marginBottom: 4 },
  payoutTime: { fontSize: 12, color: theme.colors.textMuted },
  noPayoutCard: {
    flexDirection: 'row', backgroundColor: '#FFF', padding: 20, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center'
  }
});
