import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
  zone: string;
  fleet: string;
  onNavigate: (screen: string) => void;
}

const { width } = Dimensions.get('window');

export default function AnalyticsScreen({ zone, fleet, onNavigate }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar matching Figma Screen 5 */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <TouchableOpacity onPress={() => onNavigate('Profile')}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={20} color="#FFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.locationWrap}>
            <Text style={styles.locationZoneLabel}>BENGALURU SOUTH</Text>
            <Text style={styles.locationCity}>ANALYTICS</Text>
          </View>
        </View>
        <View style={styles.protectedPill}>
          <View style={styles.activeDot} />
          <Text style={styles.protectedText}>COVERAGE ACTIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Navy Blue Card */}
        <View style={styles.totalsCard}>
          <Text style={styles.totalsLabel}>TOTAL EARNINGS PROTECTED</Text>
          <View style={styles.totalsAmountRow}>
            <Text style={styles.totalsCurrency}>₹</Text>
            <Text style={styles.totalsAmount}>14,280</Text>
            <Text style={styles.totalsSavedText}>Saved</Text>
          </View>
          <View style={styles.totalsFooter}>
            <View style={styles.totalsFooterCol}>
              <Text style={styles.totalsFooterLabel}>SUCCESS RATE</Text>
              <Text style={styles.totalsFooterVal}>98.4%</Text>
            </View>
            <View style={styles.totalsFooterDivider} />
            <View style={styles.totalsFooterCol}>
              <Text style={styles.totalsFooterLabel}>CLAIMS SETTLED</Text>
              <Text style={styles.totalsFooterVal}>24</Text>
            </View>
          </View>
        </View>

        {/* Weekly Resilience */}
        <View style={styles.resilienceHeader}>
          <Text style={styles.resilienceTitle}>Weekly Resilience</Text>
          <Text style={styles.resilienceSub}>LAST 7 DAYS</Text>
        </View>

        <View style={styles.resilienceMetrics}>
          <View>
            <Text style={styles.resilienceMetricVal}>42h 15m</Text>
            <Text style={styles.resilienceMetricLabel}>Total Working Hours</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.resilienceMetricVal, { color: '#FF7A45' }]}>38h 20m</Text>
            <Text style={styles.resilienceMetricLabel}>PROTECTED TIME</Text>
          </View>
        </View>

        {/* Bar Chart Simulation */}
        <View style={styles.chartArea}>
          <View style={styles.chartBars}>
            {[40, 60, 50, 70, 60, 80, 50].map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { height: `${h}%` }]} />
                </View>
                <Text style={styles.barDay}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
              </View>
            ))}
          </View>
          <View style={styles.chartLegendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#FF7A45' }]} />
              <Text style={styles.legendText}>PROTECTED</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#E0E2EA' }]} />
              <Text style={styles.legendText}>UNPROTECTED</Text>
            </View>
          </View>
        </View>

        {/* Two Mini Cards Row */}
        <View style={styles.miniCardsRow}>
          <View style={[styles.miniCard, { flex: 1, marginRight: 8 }]}>
            <View style={styles.miniCardIcon}>
              <Ionicons name="water" size={20} color="#FFCC00" />
            </View>
            <Text style={styles.miniCardTitle}>82%</Text>
            <Text style={styles.miniCardDesc}>Claims due to waterlogging in South Zone</Text>
            <View style={styles.miniCardBar}>
              <View style={[styles.miniCardBarFill, { width: '82%' }]} />
            </View>
          </View>
          <View style={[styles.miniCard, { flex: 1, marginLeft: 8 }]}>
            <View style={styles.miniCardIconBlue}>
              <Ionicons name="shield-checkmark" size={20} color="#FFF" />
            </View>
            <Text style={styles.miniCardTitleBlue}>IDENTITY SECURED</Text>
            <Text style={styles.miniCardDesc}>Biometric & GPS anti-fraud active</Text>
            <View style={styles.verifiedPill}>
              <Text style={styles.verifiedPillText}>VERIFIED</Text>
            </View>
          </View>
        </View>

        {/* Smart Tip */}
        <View style={styles.smartTipCard}>
          <View style={styles.smartTipIconBox}>
            <Ionicons name="bulb" size={24} color="#8A5000" />
          </View>
          <View style={styles.smartTipBody}>
            <Text style={styles.smartTipTitle}>Smart Tip for You</Text>
            <Text style={styles.smartTipText}>
              Partners in your area earned 15% more by enabling 'Rain Shield' during evening hours. Keep yours active!
            </Text>
          </View>
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
  totalsAmountRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24 },
  totalsCurrency: { fontSize: 32, fontWeight: '800', color: '#FFF', marginBottom: 6, marginRight: 4 },
  totalsAmount: { fontSize: 48, fontWeight: '900', color: '#FFF', lineHeight: 54 },
  totalsSavedText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 8, marginLeft: 8 },
  totalsFooter: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 16 },
  totalsFooterCol: { flex: 1 },
  totalsFooterLabel: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  totalsFooterVal: { fontSize: 20, color: '#FFF', fontWeight: '800' },
  totalsFooterDivider: { width: 1, height: '100%', backgroundColor: 'rgba(255,255,255,0.1)' },

  // Resilience
  resilienceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 16 },
  resilienceTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.primary },
  resilienceSub: { fontSize: 10, fontWeight: '700', color: '#FF7A45', letterSpacing: 1.5 },

  resilienceMetrics: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 24 },
  resilienceMetricVal: { fontSize: 18, fontWeight: '800', color: theme.colors.textMain, marginBottom: 4 },
  resilienceMetricLabel: { fontSize: 11, color: theme.colors.textMuted, fontWeight: '600' },

  // Chart
  chartArea: { marginHorizontal: 16, marginBottom: 24 },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', height: 120, marginBottom: 16 },
  barCol: { alignItems: 'center', justifyContent: 'flex-end', flex: 1 },
  barBg: { width: 24, height: 100, backgroundColor: '#E0E2EA', borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end', marginBottom: 8 },
  barFill: { width: '100%', backgroundColor: '#FF7A45', borderRadius: 6 },
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

  // Smart Tip
  smartTipCard: { marginHorizontal: 16, backgroundColor: '#FFF5E6', borderRadius: 16, padding: 20, flexDirection: 'row', gap: 16 },
  smartTipIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  smartTipBody: { flex: 1 },
  smartTipTitle: { fontSize: 14, fontWeight: '800', color: '#8A5000', marginBottom: 6 },
  smartTipText: { fontSize: 12, color: '#A76000', lineHeight: 18 },
});
