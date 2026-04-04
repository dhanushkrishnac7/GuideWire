import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Dimensions, Animated, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { usePayouts } from '../contexts/PayoutContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  zone: string;
  fleet: string;
  onNavigate: (screen: string) => void;
}

// Historical Monthly Payouts with Weekly Details - Realistic 150-200 range
const MONTHLY_HISTORY = [
  { 
    month: 'Jan', amount: 185, shieldLevel: 0.8,
    details: [
      { w: 1, val: 40, res: 'Rain Delay Relief', icon: 'rainy' },
      { w: 2, val: 60, res: 'Extreme Heat Support', icon: 'sunny' },
      { w: 3, val: 45, res: 'Rain Delay Relief', icon: 'rainy' },
      { w: 4, val: 40, res: 'Light Rain Support', icon: 'rainy' },
    ]
  },
  { 
    month: 'Feb', amount: 160, shieldLevel: 0.7,
    details: [
      { w: 1, val: 160, res: 'Monsoon Flood Protection', icon: 'thunderstorm' },
      { w: 2, val: 0, res: 'Shield Ready', icon: 'shield-checkmark' },
      { w: 3, val: 0, res: 'Shield Ready', icon: 'shield-checkmark' },
      { w: 4, val: 0, res: 'Shield Ready', icon: 'shield-checkmark' },
    ]
  },
  { 
    month: 'Mar', amount: 195, shieldLevel: 0.9,
    details: [
      { w: 1, val: 50, res: 'Heat Relief Support', icon: 'sunny' },
      { w: 2, val: 50, res: 'Heat Wave Protection', icon: 'sunny' },
      { w: 3, val: 45, res: 'City Traffic Surge', icon: 'navigate' },
      { w: 4, val: 50, res: 'High Temp Relief', icon: 'sunny' },
    ]
  },
  { 
    month: 'Apr', amount: 175, shieldLevel: 0.85,
    details: [
      { w: 1, val: 40, res: 'Rain Delay Relief', icon: 'rainy' },
      { w: 2, val: 0, res: 'Shield Ready', icon: 'shield-checkmark' },
      { w: 3, val: 85, res: 'Heat Wave Support', icon: 'sunny' },
      { w: 4, val: 50, res: 'Monsoon Flood Protection', icon: 'thunderstorm' },
    ]
  },
];

const DAILY_STORY = [
  { day: 'Mon', event: 'Light Rain', amount: 20, note: 'Shield covered 30min delay', icon: 'partly-sunny' },
  { day: 'Tue', event: 'Clear Sky', amount: 0, note: 'Full 8h work protected', icon: 'sunny' },
  { day: 'Wed', event: 'High Heat', amount: 25, note: 'High temp relief triggered', icon: 'thermometer' },
  { day: 'Thu', event: 'Clear Sky', amount: 0, note: 'No disruptions detected', icon: 'sunny' },
  { day: 'Fri', event: 'Heavy Rain', amount: 40, note: 'Primary disruption covered', icon: 'rainy' },
];

const WEEKLY_HISTORY = [
  { week: 1, amount: 40, status: 'Active Support', reason: 'Rain Delay Relief' },
  { week: 2, amount: 0, status: 'Shield Ready', reason: 'Shield Ready' },
  { week: 3, amount: 85, status: 'Active Support', reason: 'Heat Wave Support' },
  { week: 4, amount: 50, status: 'Active Support', reason: 'Monsoon Flood Protection' },
];

export default function AnalyticsScreen({ zone, fleet, onNavigate }: Props) {
  const { totalPayouts } = usePayouts();
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const displayTotal = totalPayouts + 175;

  const toggleMonth = (month: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const chartAnims = useRef(MONTHLY_HISTORY.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    Animated.stagger(150, chartAnims.map((anim, i) => 
      Animated.spring(anim, {
        toValue: MONTHLY_HISTORY[i].shieldLevel,
        useNativeDriver: false,
        damping: 12,
        stiffness: 90
      })
    )).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Profile')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <View style={styles.statusPill}>
          <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.statusText}>SHIELD ACTIVE</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Hero - Simplified Financial Hero */}
          <View style={styles.heroSection}>
            <Text style={styles.heroLabel}>CASH SECURED THIS MONTH</Text>
            <Text style={styles.heroAmount}>₹{displayTotal.toLocaleString()}</Text>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText}>PROTECTED FOR 4 MONTHS</Text>
            </View>
          </View>

          {/* Daily Resilience Scroll */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Disruptions Phase</Text>
            <View style={styles.liveBadge}>
               <View style={styles.liveDot} />
               <Text style={styles.liveBadgeText}>LIVE SYNC</Text>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
          >
            {DAILY_STORY.map((item, i) => {
              const isActive = item.amount > 0;
              return (
                <LinearGradient 
                  key={i}
                  colors={isActive ? ['#022C22', '#064E3B'] : ['#FFF', '#FFF']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[styles.dayCard, isActive && styles.dayCardActive]}
                >
                  {isActive && (
                    <>
                      <View style={styles.glowEffect} />
                      <View style={styles.decorCircleLarge} />
                    </>
                  )}
                  
                  <View style={styles.dayTop}>
                    <View style={[styles.datePill, isActive && { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                      <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{item.day}</Text>
                    </View>
                    <View style={[styles.iconCircle, isActive && styles.iconCircleActive]}>
                      <Ionicons
                        name={item.icon as any}
                        size={16}
                        color={isActive ? "#10B981" : theme.colors.textMuted}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.eventContainer}>
                    <Text style={[styles.eventLabel, isActive && styles.eventLabelActive]}>{item.event}</Text>
                    <Text style={[styles.dayNote, isActive && styles.dayNoteActive]}>{item.note}</Text>
                  </View>
                  
                  <View style={[styles.dayDivider, isActive && styles.dayDividerActive]} />
                  
                  <View style={styles.dayBottom}>
                    <View>
                      <Text style={[styles.amountLabel, isActive && styles.amountLabelActive]}>
                        {isActive ? 'PAYOUT EXECUTED' : 'STATUS'}
                      </Text>
                      {isActive && (
                         <View style={styles.oracleBadge}>
                            <Ionicons name="hardware-chip" size={10} color="#10B981" />
                            <Text style={styles.oracleText}>Verified by Oracle</Text>
                         </View>
                      )}
                    </View>
                    <Text style={[styles.dayAmount, isActive && styles.dayAmountActive]}>
                      {isActive ? `+₹${item.amount}` : 'SECURED'}
                    </Text>
                  </View>
                </LinearGradient>
              );
            })}
          </ScrollView>

          {/* Weekly Shield Status - Current Month Breakdown */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Shield Status</Text>
          </View>
          <View style={styles.weeklyCard}>
            {WEEKLY_HISTORY.map((w, i) => (
              <View key={i} style={styles.weeklyRow}>
                <View style={styles.weeklyInfo}>
                  <Text style={styles.weekLabel}>WEEK {i + 1}</Text>
                  <Text style={styles.weekStatus}>{w.reason}</Text>
                </View>
                <View style={styles.weekResult}>
                  <Text style={[styles.weekAmount, w.amount > 0 && { color: '#039855' }]}>
                    {w.amount > 0 ? `+₹${w.amount}` : 'SECURED'}
                  </Text>
                  <Ionicons 
                    name={w.amount > 0 ? "checkmark-circle" : "shield"} 
                    size={16} 
                    color={w.amount > 0 ? "#039855" : theme.colors.textMuted} 
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Monthly Resilience Trend Animated Chart */}
          <View style={styles.chartCardModern}>
            <View style={styles.chartHeader}>
               <View>
                 <Text style={styles.chartTitleModern}>Resilience Trend</Text>
                 <Text style={styles.chartSubModern}>Average coverage of ₹178/mo</Text>
               </View>
               <Ionicons name="stats-chart" size={20} color={theme.colors.primary} />
            </View>
            
            <View style={styles.chartRowModern}>
              {/* Background Gridlines */}
              <View style={styles.chartGridLine} />
              <View style={[styles.chartGridLine, { top: '50%' }]} />
              
              {MONTHLY_HISTORY.map((m, i) => {
                const isActive = i === 3;
                return (
                  <View key={i} style={styles.chartColModern}>
                    <Text style={[styles.chartValTooltip, isActive && styles.chartValTooltipActive]}>
                      ₹{m.amount}
                    </Text>
                    <View style={[styles.barContainerModern, isActive && styles.barContainerActive]}>
                      <Animated.View style={[
                        styles.barFillModern, 
                        isActive && styles.barFillModernActive,
                        { height: chartAnims[i].interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }
                      ]} />
                    </View>
                    <Text style={[styles.chartMonthLabelModern, isActive && styles.chartMonthLabelActive]}>
                      {m.month}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Protection Overview - INTERACTIVE ACCORDION AREA */}
          <View style={styles.vizCard}>
            <Text style={styles.vizTitle}>Protection Overview</Text>
            <View style={styles.vizRows}>
              {MONTHLY_HISTORY.map((m, idx) => (
                <View key={idx} style={[styles.accordionItem, expandedMonth === m.month && styles.accordionItemActive]}>
                  <TouchableOpacity 
                    onPress={() => toggleMonth(m.month)}
                    style={styles.vizRow}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.vizIcon, expandedMonth === m.month && styles.vizIconActive]}>
                      <Ionicons 
                        name={expandedMonth === m.month ? "chevron-down" : "shield-checkmark"} 
                        size={16} 
                        color={expandedMonth === m.month ? "#FFF" : theme.colors.primary} 
                      />
                    </View>
                    <View style={styles.vizTextCol}>
                      <Text style={styles.vizRowTitle}>{m.month} Secured</Text>
                      <Text style={styles.vizRowSub}>₹{m.amount} total coverage received</Text>
                    </View>
                    <Ionicons 
                      name={expandedMonth === m.month ? "eye-off-outline" : "eye-outline"} 
                      size={18} 
                      color={theme.colors.textMuted} 
                    />
                  </TouchableOpacity>

                  {expandedMonth === m.month && (
                    <View style={styles.detailsContainer}>
                      <View style={styles.detailsDivider} />
                      {m.details.map((det, i) => (
                        <View key={i} style={styles.detailRow}>
                          <View style={styles.detailIconBox}>
                            <Ionicons name={det.icon as any} size={14} color={theme.colors.primary} />
                          </View>
                          <Text style={styles.detailWeek}>W{det.w}</Text>
                          <Text style={styles.detailReason}>{det.res}</Text>
                          <Text style={[styles.detailAmount, det.val > 0 && { color: '#039855' }]}>
                            {det.val > 0 ? `+₹${det.val}` : 'SECURED'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footerSpace} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F4F7'
  },
  backButton: { padding: 8 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#ECFDF3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#039855' },
  statusText: { fontSize: 10, fontWeight: '800', color: '#039855', letterSpacing: 0.5 },

  scroll: { paddingTop: 20 },

  // Hero
  heroSection: { alignItems: 'center', marginBottom: 40 },
  heroLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  heroAmount: { fontSize: 52, fontWeight: '900', color: theme.colors.primary, marginBottom: 16 },
  heroPill: { backgroundColor: theme.colors.primary + '10', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  heroPillText: { fontSize: 11, fontWeight: '800', color: theme.colors.primary },

  // Section Header
  sectionHeader: { paddingHorizontal: 24, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: theme.colors.primary },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF3', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  liveBadgeText: { fontSize: 10, fontWeight: '800', color: '#039855', letterSpacing: 1 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#039855' },

  // Daily Scroll
  horizontalScroll: { paddingHorizontal: 24, gap: 16, paddingBottom: 24 },
  dayCard: { 
    width: CARD_WIDTH, borderRadius: 28, padding: 24, 
    borderWidth: 1, borderColor: '#EAECF0',
    shadowColor: '#101828', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    position: 'relative', overflow: 'hidden'
  },
  dayCardActive: { 
    borderColor: '#064E3B',
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10
  },
  glowEffect: { 
    position: 'absolute', top: -60, right: -60, width: 200, height: 200, 
    borderRadius: 100, backgroundColor: '#10B981', opacity: 0.15 
  },
  decorCircleLarge: {
     position: 'absolute', bottom: -30, left: -30, width: 120, height: 120,
     borderRadius: 60, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.1)'
  },
  dayTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 1 },
  datePill: { backgroundColor: '#F2F4F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  dayText: { fontSize: 13, fontWeight: '800', color: theme.colors.textMuted },
  dayTextActive: { color: '#FFF' },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F2F4F7', justifyContent: 'center', alignItems: 'center' },
  iconCircleActive: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  eventContainer: { marginBottom: 20, zIndex: 1 },
  eventLabel: { fontSize: 20, fontWeight: '900', color: theme.colors.primary, marginBottom: 8 },
  eventLabelActive: { color: '#FFF' },
  dayDivider: { height: 1, backgroundColor: '#EAECF0', marginBottom: 20, zIndex: 1 },
  dayDividerActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  dayBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 1 },
  amountLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  amountLabelActive: { color: 'rgba(255,255,255,0.5)' },
  oracleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  oracleText: { fontSize: 9, color: '#10B981', fontWeight: '800', textTransform: 'uppercase' },
  dayAmount: { fontSize: 28, fontWeight: '900', color: theme.colors.textMuted },
  dayAmountActive: { color: '#10B981' },
  dayNote: { fontSize: 13, color: theme.colors.textSub, lineHeight: 20 },
  dayNoteActive: { color: 'rgba(255,255,255,0.7)' },

  // Weekly Card
  weeklyCard: { marginHorizontal: 24, backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 32, borderWidth: 1, borderColor: '#EAECF0' },
  weeklyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F4F7' },
  weeklyInfo: { gap: 2 },
  weekLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted },
  weekStatus: { fontSize: 13, fontWeight: '700', color: theme.colors.primary },
  weekResult: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekAmount: { fontSize: 15, fontWeight: '800', color: theme.colors.textMuted },

  chartCardModern: { 
    marginHorizontal: 24, backgroundColor: '#FFF', borderRadius: 28, padding: 24, marginBottom: 32, 
    borderWidth: 1, borderColor: '#EAECF0', shadowColor: '#101828', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  chartTitleModern: { fontSize: 16, fontWeight: '900', color: theme.colors.primary, marginBottom: 4 },
  chartSubModern: { fontSize: 13, color: theme.colors.textMuted, fontWeight: '600' },
  chartRowModern: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120, paddingHorizontal: 16, position: 'relative' },
  chartGridLine: { position: 'absolute', left: 0, right: 0, top: 0, height: 1, backgroundColor: '#EAECF0' },
  chartColModern: { alignItems: 'center', flex: 1, zIndex: 1 },
  chartValTooltip: { fontSize: 11, fontWeight: '800', color: theme.colors.textMuted, marginBottom: 6 },
  chartValTooltipActive: { color: '#10B981', fontSize: 12, fontWeight: '900', marginBottom: 6 },
  barContainerModern: { height: 70, width: 10, backgroundColor: '#F9FAFB', borderRadius: 5, justifyContent: 'flex-end', marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#EAECF0' },
  barContainerActive: { borderColor: 'rgba(16, 185, 129, 0.2)', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
  barFillModern: { width: '100%', borderRadius: 5, backgroundColor: '#E4E7EC' },
  barFillModernActive: { backgroundColor: '#10B981', borderRadius: 5 },
  chartMonthLabelModern: { fontSize: 11, fontWeight: '700', color: theme.colors.textMuted },
  chartMonthLabelActive: { color: theme.colors.primary, fontWeight: '900' },

  // Viz Card
  vizCard: { marginHorizontal: 24, backgroundColor: '#F8F9FC', borderRadius: 28, padding: 24, marginBottom: 40 },
  vizTitle: { fontSize: 13, fontWeight: '800', color: theme.colors.primary, marginBottom: 24 },
  vizRows: { gap: 12 },
  accordionItem: { backgroundColor: '#FFF', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#EAECF0' },
  accordionItemActive: { borderColor: theme.colors.primary, backgroundColor: '#FFF' },
  vizRow: { flexDirection: 'row', gap: 16, alignItems: 'center', padding: 16 },
  vizIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAECF0' },
  vizIconActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  vizTextCol: { flex: 1 },
  vizRowTitle: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, marginBottom: 2 },
  vizRowSub: { fontSize: 11, color: theme.colors.textMuted },
  
  detailsContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  detailsDivider: { height: 1, backgroundColor: '#F2F4F7', marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  detailIconBox: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#F2F4F7', justifyContent: 'center', alignItems: 'center' },
  detailWeek: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, width: 28 },
  detailReason: { fontSize: 11, fontWeight: '600', color: theme.colors.primary, flex: 1 },
  detailAmount: { fontSize: 12, fontWeight: '800', color: theme.colors.textMuted },

  footerSpace: { height: 100 }
});
