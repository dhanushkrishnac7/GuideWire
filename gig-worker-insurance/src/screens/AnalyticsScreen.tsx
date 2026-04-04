import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions, Animated
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { usePayouts } from '../contexts/PayoutContext';

interface Props {
  zone: string;
  fleet: string;
  onNavigate: (screen: string) => void;
}

const { width } = Dimensions.get('window');
const STREAK_KEY = 'gigshield_protection_streak';

export default function AnalyticsScreen({ zone, fleet, onNavigate }: Props) {
  const { totalPayouts, recentPayouts } = usePayouts();
  const [streak, setStreak] = useState(1);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const saved = await AsyncStorage.getItem(STREAK_KEY);
      if (saved) setStreak(parseInt(saved, 10));
    } catch (e) {
      console.error('Failed to load streak', e);
    }
  };

  const mockBaseAmount = 3450;
  const displayTotal = totalPayouts + mockBaseAmount;
  const displayClaims = recentPayouts.length + 5; // +5 mock claims
  const lossWithoutInsurace = displayTotal * 1.25; 
  const roi = displayTotal > 0 ? (displayTotal / 490).toFixed(1) : '7.0'; // Approx ROI

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar with simple labels */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => onNavigate('Profile')}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.locationWrap}>
            <Text style={styles.locationZoneLabel}>{zone.toUpperCase()}</Text>
            <Text style={styles.locationCity}>WEEKLY REPORT</Text>
          </View>
        </View>
        <View style={styles.protectedPill}>
          <Ionicons name="shield-checkmark" size={12} color="#FF7A45" />
          <Text style={styles.protectedText}>YOU ARE SAFE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Main Stats Card - Simplified & Aligned */}
          <View style={styles.totalsCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.totalsLabel}>MONEY SAVED 💰</Text>
              <View style={styles.streakBadge}>
                <Ionicons name="flame" size={12} color="#FF7A45" />
                <Text style={styles.streakText}>{streak} WEEKS STRONG</Text>
              </View>
            </View>
            <View style={styles.totalsAmountContainer}>
              <Text style={styles.totalsCurrency}>₹</Text>
              <Text style={styles.totalsAmount}>{displayTotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalsFooter}>
              <View style={styles.totalsFooterCol}>
                <Text style={styles.totalsFooterLabel}>HELPS RECEIVED</Text>
                <Text style={styles.totalsFooterVal}>{displayClaims}</Text>
              </View>
              <View style={styles.totalsFooterDivider} />
              <View style={styles.totalsFooterCol}>
                <Text style={styles.totalsFooterLabel}>PROFIT SCORE</Text>
                <Text style={styles.totalsFooterVal}>{roi}x More</Text>
              </View>
            </View>
          </View>

        {/* Weekly Progress - Thicker, better aligned bars */}
        <View style={styles.resilienceHeader}>
          <Text style={styles.resilienceTitle}>Your Weekly Safety</Text>
          <View style={styles.resilienceLegend}>
            <View style={[styles.legendDot, { backgroundColor: '#FF7A45' }]} />
            <Text style={styles.legendText}>SAFE</Text>
          </View>
        </View>

        <View style={styles.chartArea}>
          <View style={styles.chartBars}>
            {[45, 65, 80, 50, 90, 75, 40].map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { height: `${h}%` }]} />
                </View>
                <Text style={styles.barDay}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Two Mini Cards Row */}
        <View style={styles.miniCardsRow}>
          <View style={[styles.miniCard, { flex: 1, marginRight: 8 }]}>
            <View style={styles.miniCardIcon}>
              <Ionicons name="trending-down" size={20} color="#E8472A" />
            </View>
            <Text style={styles.miniCardTitle}>₹{lossWithoutInsurace.toLocaleString()}</Text>
            <Text style={styles.miniCardDesc}>Loss if no Shield ❌</Text>
            <View style={styles.miniCardBar}>
              <View style={[styles.miniCardBarFill, { width: '100%', backgroundColor: '#E8472A' }]} />
            </View>
          </View>
          <View style={[styles.miniCard, { flex: 1, marginLeft: 8 }]}>
            <View style={styles.miniCardIconBlue}>
              <Ionicons name="finger-print" size={20} color="#FFF" />
            </View>
            <Text style={styles.miniCardTitleBlue}>YOU ARE YOU ✅</Text>
            <Text style={styles.miniCardDesc}>Secure Identity & GPS Locked</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedPillText}>VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Safety Score Section */}
        <View style={styles.resilienceHeader}>
          <Text style={styles.resilienceTitle}>Your Safety Score</Text>
          <Text style={styles.resilienceSub}>740 / 1000</Text>
        </View>

        <View style={styles.riskCard}>
          <View style={styles.riskHeader}>
            <View>
              <Text style={styles.riskLabel}>CURRENT STATUS</Text>
              <Text style={styles.riskStatus}>GOOD ⭐</Text>
            </View>
            <View style={styles.riskScoreBox}>
              <Text style={styles.riskScore}>+15 Today</Text>
            </View>
          </View>
          <View style={styles.riskProgressBg}>
            <View style={[styles.riskProgressFill, { width: '74%', backgroundColor: '#2ECC71' }]} />
          </View>
          <Text style={styles.riskInfo}>
            You are doing great! Keep your Shield ON to stay safe and earn more rewards.
          </Text>
        </View>

        {/* Smart Tip */}
        <View style={styles.smartTipCard}>
          <View style={styles.smartTipIconBox}>
            <Ionicons name="bulb" size={24} color="#8A5000" />
          </View>
          <View style={styles.smartTipBody}>
            <Text style={styles.smartTipTitle}>Smart Tip for You</Text>
            <Text style={styles.smartTipText}>
              GigShield partners with a {roi}x ROI are 40% more likely to maintain their Tier-1 status.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
        </Animated.View>
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
  locationZoneLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5 },
  locationCity: { fontSize: 16, fontWeight: '900', color: theme.colors.primary, marginTop: 2 },
  protectedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8EEFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF7A45' },
  protectedText: { fontSize: 10, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5 },

  scroll: { paddingTop: 10, paddingBottom: 40 },

  // Totals Card
  totalsCard: {
    marginHorizontal: 16, backgroundColor: theme.colors.primary, borderRadius: 16,
    padding: 24, marginBottom: 24, shadowColor: '#1A1B4B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  totalsLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, marginBottom: 10 },
  totalsAmountContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24, alignSelf: 'center' },
  totalsCurrency: { fontSize: 32, fontWeight: '800', color: '#FFF', marginRight: 4 },
  totalsAmount: { fontSize: 48, fontWeight: '900', color: '#FFF' },
  totalsSavedText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginLeft: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
  streakText: { fontSize: 9, fontWeight: '800', color: '#FF7A45' },
  totalsFooter: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 16 },
  totalsFooterCol: { flex: 1, alignItems: 'center' },
  totalsFooterLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  totalsFooterVal: { fontSize: 20, color: '#FFF', fontWeight: '800' },
  totalsFooterDivider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' },

  // Resilience
  resilienceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 16 },
  resilienceTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.primary },
  resilienceSub: { fontSize: 10, fontWeight: '700', color: '#FF7A45', letterSpacing: 1.5 },
  resilienceLegend: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  resilienceMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 24 },
  resilienceMetricVal: { fontSize: 18, fontWeight: '800', color: theme.colors.textMain, marginBottom: 4 },
  resilienceMetricLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },

  // Chart
  chartArea: { marginHorizontal: 16, marginBottom: 24 },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', height: 120, marginBottom: 16 },
  barCol: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  barBg: { width: 36, height: 100, backgroundColor: '#E0E2EA', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end', marginBottom: 8 },
  barFill: { width: '100%', backgroundColor: '#FF7A45', borderRadius: 8 },
  barDay: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted },
  chartLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5 },

  // Mini Cards
  miniCardsRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 20 },
  miniCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: theme.colors.border },
  miniCardIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF5E6', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  miniCardTitle: { fontSize: 24, fontWeight: '900', color: theme.colors.primary, marginBottom: 4 },
  miniCardDesc: { fontSize: 11, color: theme.colors.textSub, lineHeight: 16, flex: 1, marginBottom: 16 },
  miniCardBar: { height: 4, width: '100%', backgroundColor: '#E0E2EA', borderRadius: 2 },
  miniCardBarFill: { height: '100%', backgroundColor: '#FFCC00', borderRadius: 2 },

  miniCardIconBlue: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  miniCardTitleBlue: { fontSize: 13, fontWeight: '900', color: theme.colors.primary, marginBottom: 4 },
  verifiedPill: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start' },
  verifiedPillText: { fontSize: 10, fontWeight: '800', color: '#FFF' },

  // Risk Card
  riskCard: { marginHorizontal: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: theme.colors.border },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  riskLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5, marginBottom: 4 },
  riskStatus: { fontSize: 18, fontWeight: '900', color: theme.colors.primary },
  riskScoreBox: { backgroundColor: '#F5F5F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  riskScore: { fontSize: 16, fontWeight: '900', color: '#FF7A45' },
  riskProgressBg: { height: 6, backgroundColor: '#F5F5F7', borderRadius: 3, marginBottom: 12, overflow: 'hidden' },
  riskProgressFill: { height: '100%', backgroundColor: '#FF7A45', borderRadius: 3 },
  riskInfo: { fontSize: 11, color: theme.colors.textSub, lineHeight: 16 },

  // Smart Tip
  smartTipCard: { marginHorizontal: 16, backgroundColor: '#FFF5E6', borderRadius: 16, padding: 20, flexDirection: 'row', gap: 16 },
  smartTipIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  smartTipBody: { flex: 1 },
  smartTipTitle: { fontSize: 14, fontWeight: '800', color: '#8A5000', marginBottom: 6 },
  smartTipText: { fontSize: 12, color: '#A76000', lineHeight: 18 },
});
