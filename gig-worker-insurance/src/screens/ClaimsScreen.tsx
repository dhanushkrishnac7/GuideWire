import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { theme, Icon } from '../theme';
import { getClaimHistory } from '../services/claimProcessor';
import { getActiveTriggers, getConfiguration } from '../services/triggerEngine';
import { ClaimRecord } from '../types/triggers';
import { GlobalPayoutBanner } from '../components/GlobalPayoutBanner';

interface Props {
  zone: string;
  onNavigate: (screen: string) => void;
}

// Mock worker ID - in production this would come from auth context
const MOCK_WORKER_ID = 'worker_001';

export default function ClaimsScreen({ zone, onNavigate }: Props) {
  const [claimHistory, setClaimHistory] = useState<ClaimRecord[]>([]);
  const [activeTriggers, setActiveTriggers] = useState<Array<{
    type: 'rain' | 'heat' | 'traffic';
    lastTriggered: number;
    cooldownUntil: number;
  }>>([]);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [filterType, setFilterType] = useState<'all' | 'rain' | 'heat' | 'traffic'>('all');
  const [loading, setLoading] = useState(true);

  const [showPayout, setShowPayout] = useState(false);
  const payoutScale = useRef(new Animated.Value(0.8)).current;
  const payoutOpacity = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Load claim history and active triggers
  useEffect(() => {
    loadData();

    // Refresh data every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const claims = await getClaimHistory(MOCK_WORKER_ID);
      setClaimHistory(claims);

      const triggers = getActiveTriggers(MOCK_WORKER_ID);
      setActiveTriggers(triggers);

      setLoading(false);
    } catch (error) {
      console.error('Error loading claims data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    if (claimHistory.length > 0 && claimHistory[0].status === 'SUCCESS') {
      setTimeout(() => {
        setShowPayout(true);
        Animated.parallel([
          Animated.spring(payoutScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
          Animated.timing(payoutOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 1200);
    }
  }, [claimHistory]);

  // Filter and sort claims
  const filteredClaims = claimHistory
    .filter(claim => filterType === 'all' || claim.triggerEvent.type === filterType)
    .sort((a, b) => {
      if (sortBy === 'date') return b.createdAt - a.createdAt;
      if (sortBy === 'amount') return b.triggerEvent.payoutAmount - a.triggerEvent.payoutAmount;
      if (sortBy === 'type') return a.triggerEvent.type.localeCompare(b.triggerEvent.type);
      return 0;
    });

  // Calculate totals by trigger type
  const totalsByType = claimHistory
    .filter(c => c.status === 'SUCCESS')
    .reduce((acc, claim) => {
      const type = claim.triggerEvent.type;
      acc[type] = (acc[type] || 0) + claim.triggerEvent.payoutAmount;
      acc.total += claim.triggerEvent.payoutAmount;
      return acc;
    }, { rain: 0, heat: 0, traffic: 0, total: 0 } as Record<string, number>);

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'rain': return Icon.rain;
      case 'heat': return Icon.heat;
      case 'traffic': return Icon.car;
      default: return Icon.checkCircle;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 0) return 'Today, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday, ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatCooldownTime = (cooldownUntil: number) => {
    const now = Date.now();
    const remainingMs = cooldownUntil - now;
    if (remainingMs <= 0) return 'Ready';

    const remainingMins = Math.ceil(remainingMs / 60000);
    const hours = Math.floor(remainingMins / 60);
    const mins = remainingMins % 60;

    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const latestClaim = claimHistory.length > 0 ? claimHistory[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.avatarCircle}><Text style={styles.avatarText}>RS</Text></View>
          <View>
            <Text style={styles.zoneLabel}>ZONE</Text>
            <Text style={styles.zoneName}>{zone.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.coveragePill}>
          <View style={styles.coverageDot} />
          <Text style={styles.coverageText}>COVERAGE ACTIVE</Text>
        </View>
      </View>

      <Animated.ScrollView contentContainerStyle={styles.scroll} style={{ opacity: fadeAnim }} showsVerticalScrollIndicator={false}>
        {/* Global Payout Banner */}
        <GlobalPayoutBanner onPress={() => { }} />

        {/* Live Trigger Status */}
        {activeTriggers.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>ACTIVE TRIGGERS</Text>
            <View style={styles.card}>
              {activeTriggers.map((trigger, i) => (
                <View key={trigger.type} style={[styles.triggerRow, i < activeTriggers.length - 1 && styles.verifyRowBorder]}>
                  <View style={styles.triggerIconBox}>
                    <Text style={styles.triggerIconText}>{getTriggerIcon(trigger.type)}</Text>
                  </View>
                  <View style={styles.triggerBody}>
                    <Text style={styles.triggerType}>{trigger.type.charAt(0).toUpperCase() + trigger.type.slice(1)} Trigger</Text>
                    <Text style={styles.triggerCooldown}>Cooldown: {formatCooldownTime(trigger.cooldownUntil)}</Text>
                  </View>
                  <View style={styles.triggerPulse} />
                </View>
              ))}
            </View>
          </>
        )}

        {/* Latest Claim Alert */}
        {latestClaim && latestClaim.status === 'SUCCESS' && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIconBox}>
              <Text style={styles.alertIconText}>{getTriggerIcon(latestClaim.triggerEvent.type)}</Text>
            </View>
            <View style={styles.alertBody}>
              <Text style={styles.alertTitle}>
                {latestClaim.triggerEvent.type === 'rain' ? 'Heavy Rain' :
                  latestClaim.triggerEvent.type === 'heat' ? 'Extreme Heat' :
                    'Traffic Gridlock'} Detected in Your Zone
              </Text>
              <Text style={styles.alertSub}>
                Automatic parametric protection has been engaged for {zone}.
              </Text>
            </View>
          </View>
        )}

        {/* Parametric Verification */}
        {latestClaim && (
          <>
            <Text style={styles.sectionLabel}>PARAMETRIC VERIFICATION</Text>
            <View style={styles.card}>
              {latestClaim.verificationSteps.map((step, i) => (
                <View key={i} style={[styles.verifyRow, i < latestClaim.verificationSteps.length - 1 && styles.verifyRowBorder]}>
                  <View style={[styles.verifyDot, step.result === 'pass' ? {} : styles.verifyDotFail]}>
                    <Text style={styles.verifyDotText}>{step.result === 'pass' ? Icon.checkCircle : '✗'}</Text>
                  </View>
                  <Text style={[styles.verifyLabel, step.result === 'fail' && styles.verifyLabelFail]}>{step.step.replace(/_/g, ' ')}</Text>
                  <Text style={styles.verifyTime}>{new Date(step.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Payout Card */}
        {showPayout && latestClaim && latestClaim.status === 'SUCCESS' && (
          <Animated.View style={[styles.payoutCard, { transform: [{ scale: payoutScale }], opacity: payoutOpacity }]}>
            <View style={styles.payoutIconCircle}>
              <Text style={styles.payoutIconText}>{Icon.checkCircle}</Text>
            </View>
            <Text style={styles.payoutAmount}>₹{latestClaim.triggerEvent.payoutAmount} Sent to UPI</Text>
            <Text style={styles.payoutSubLabel}>Instant Parametric Settlement Complete</Text>
            <View style={styles.payoutMetaRow}>
              <View>
                <Text style={styles.payoutMetaLabel}>INCOME SAVED</Text>
                <Text style={styles.payoutMetaValue}>₹{latestClaim.triggerEvent.payoutAmount.toFixed(2)}</Text>
              </View>
              <View>
                <Text style={styles.payoutMetaLabel}>STATUS</Text>
                <View style={styles.successBadge}>
                  <Text style={styles.successIcon}>{Icon.flash}</Text>
                  <Text style={styles.successText}>{latestClaim.status}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.payoutNote}>
              Automatic payouts are triggered when {latestClaim.triggerEvent.type} conditions exceed thresholds in your active delivery zone.{' '}
              <Text style={styles.payoutNoteLink}>Learn how it's calculated.</Text>
            </Text>
          </Animated.View>
        )}

        {/* Compensation Summary by Type */}
        {totalsByType.total > 0 && (
          <>
            <Text style={styles.sectionLabel}>COMPENSATION BY TRIGGER TYPE</Text>
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>{Icon.rain}</Text>
                  <Text style={styles.summaryLabel}>Rain</Text>
                  <Text style={styles.summaryAmount}>₹{totalsByType.rain}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>{Icon.heat}</Text>
                  <Text style={styles.summaryLabel}>Heat</Text>
                  <Text style={styles.summaryAmount}>₹{totalsByType.heat}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryIcon}>{Icon.car}</Text>
                  <Text style={styles.summaryLabel}>Traffic</Text>
                  <Text style={styles.summaryAmount}>₹{totalsByType.traffic}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Filter and Sort Controls */}
        <View style={styles.controlsRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.controlLabel}>FILTER:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['all', 'rain', 'heat', 'traffic'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterBtn, filterType === type && styles.filterBtnActive]}
                  onPress={() => setFilterType(type as any)}
                >
                  <Text style={[styles.filterBtnText, filterType === type && styles.filterBtnTextActive]}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.sortGroup}>
            <Text style={styles.controlLabel}>SORT:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {[{ key: 'date', label: 'DATE' }, { key: 'amount', label: 'AMOUNT' }, { key: 'type', label: 'TYPE' }].map(sort => (
                <TouchableOpacity
                  key={sort.key}
                  style={[styles.filterBtn, sortBy === sort.key && styles.filterBtnActive]}
                  onPress={() => setSortBy(sort.key as any)}
                >
                  <Text style={[styles.filterBtnText, sortBy === sort.key && styles.filterBtnTextActive]}>
                    {sort.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Claims History */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>CLAIMS HISTORY</Text>
            <Text style={styles.totalSaved}>Total: ₹{totalsByType.total}</Text>
          </View>
          {loading ? (
            <Text style={styles.loadingText}>Loading claims...</Text>
          ) : filteredClaims.length === 0 ? (
            <Text style={styles.emptyText}>No claims found</Text>
          ) : (
            filteredClaims.map(claim => (
              <View key={claim.id} style={styles.claimRow}>
                <View style={styles.claimIconBox}>
                  <Text style={styles.claimIconText}>{getTriggerIcon(claim.triggerEvent.type)}</Text>
                </View>
                <View style={styles.claimBody}>
                  <Text style={styles.claimType}>
                    {claim.triggerEvent.type.charAt(0).toUpperCase() + claim.triggerEvent.type.slice(1)}
                  </Text>
                  <Text style={styles.claimDate}>{formatDate(claim.createdAt)}</Text>
                </View>
                <View style={styles.claimRight}>
                  <Text style={styles.claimAmount}>+₹{claim.triggerEvent.payoutAmount}</Text>
                  <View style={[
                    styles.claimStatusBadge,
                    claim.status === 'FAILED' && styles.claimStatusBadgeFailed,
                    claim.status === 'REJECTED' && styles.claimStatusBadgeRejected,
                    claim.status === 'FRAUD_HOLD' && { backgroundColor: '#FFF5E6' }
                  ]}>
                    <Text style={[
                      styles.claimStatusText,
                      claim.status === 'FAILED' && styles.claimStatusTextFailed,
                      claim.status === 'REJECTED' && styles.claimStatusTextRejected,
                      claim.status === 'FRAUD_HOLD' && { color: '#FF9800' }
                    ]}>
                      {claim.status === 'FRAUD_HOLD' ? '24H HOLD 🛡️' : claim.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.viewTxnBtn} onPress={() => onNavigate('Analytics')}>
          <Text style={styles.viewTxnText}>View Transaction {Icon.receipt}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backDashBtn} onPress={() => onNavigate('Home')}>
          <Text style={styles.backDashText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  zoneLabel: { fontSize: 9, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1 },
  zoneName: { fontSize: 16, fontWeight: '900', color: theme.colors.primary },
  coveragePill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E8F8F0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  coverageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.success },
  coverageText: { fontSize: 10, fontWeight: '700', color: theme.colors.success, letterSpacing: 0.5 },

  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },

  alertBanner: { flexDirection: 'row', backgroundColor: '#FFF9C4', borderRadius: 14, padding: 16, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: theme.colors.warning },
  alertIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.warning, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertIconText: { fontSize: 22 },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '800', color: theme.colors.primary, marginBottom: 4 },
  alertSub: { fontSize: 12, color: theme.colors.textSub, lineHeight: 17 },

  sectionLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 12 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 16 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalSaved: { fontSize: 13, fontWeight: '700', color: theme.colors.success },

  // Active Triggers
  triggerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  triggerIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0F0FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  triggerIconText: { fontSize: 18 },
  triggerBody: { flex: 1 },
  triggerType: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, marginBottom: 2 },
  triggerCooldown: { fontSize: 11, color: theme.colors.textMuted },
  triggerPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.accent },

  verifyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  verifyRowBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  verifyDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.success, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  verifyDotHighlight: { backgroundColor: theme.colors.accent },
  verifyDotFail: { backgroundColor: '#FF6B6B' },
  verifyDotText: { fontSize: 14 },
  verifyLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: theme.colors.textSub },
  verifyLabelHighlight: { color: theme.colors.accent, fontWeight: '700' },
  verifyLabelFail: { color: '#FF6B6B', fontWeight: '700' },
  verifyTime: { fontSize: 11, color: theme.colors.textMuted, fontFamily: 'monospace' },
  verifyDotRow: { flexDirection: 'row', gap: 3 },
  verifyDotSmall: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.accent },

  payoutCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center', borderWidth: 2, borderColor: theme.colors.accent },
  payoutIconCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  payoutIconText: { fontSize: 28 },
  payoutAmount: { fontSize: 28, fontWeight: '900', color: theme.colors.primary, marginBottom: 4 },
  payoutSubLabel: { fontSize: 13, color: theme.colors.textSub, marginBottom: 20 },
  payoutMetaRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },
  payoutMetaLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  payoutMetaValue: { fontSize: 20, fontWeight: '800', color: theme.colors.primary },
  successBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F8F0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  successIcon: { fontSize: 12 },
  successText: { fontSize: 12, fontWeight: '700', color: theme.colors.success },
  payoutNote: { fontSize: 11, color: theme.colors.textMuted, lineHeight: 16, textAlign: 'center' },
  payoutNoteLink: { color: theme.colors.primary, fontWeight: '600' },

  // Compensation Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryIcon: { fontSize: 24, marginBottom: 6 },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 4 },
  summaryAmount: { fontSize: 16, fontWeight: '800', color: theme.colors.primary },

  // Filter and Sort Controls
  controlsRow: { marginBottom: 16 },
  filterGroup: { marginBottom: 12 },
  sortGroup: { marginBottom: 12 },
  controlLabel: { fontSize: 10, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 1, marginBottom: 8 },
  filterScroll: { flexDirection: 'row' },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F0F0F0', marginRight: 8 },
  filterBtnActive: { backgroundColor: theme.colors.primary },
  filterBtnText: { fontSize: 11, fontWeight: '700', color: theme.colors.textSub },
  filterBtnTextActive: { color: '#FFF' },

  claimRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  claimIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#F0F0FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  claimIconText: { fontSize: 18 },
  claimBody: { flex: 1 },
  claimType: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, marginBottom: 2 },
  claimDate: { fontSize: 11, color: theme.colors.textMuted },
  claimRight: { alignItems: 'flex-end' },
  claimAmount: { fontSize: 15, fontWeight: '800', color: theme.colors.success, marginBottom: 4 },
  claimStatusBadge: { backgroundColor: '#E8F8F0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  claimStatusBadgeFailed: { backgroundColor: '#FFE8E8' },
  claimStatusBadgeRejected: { backgroundColor: '#FFF3E0' },
  claimStatusText: { fontSize: 9, fontWeight: '700', color: theme.colors.success, letterSpacing: 0.5 },
  claimStatusTextFailed: { color: '#FF6B6B' },
  claimStatusTextRejected: { color: '#FF9800' },

  loadingText: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 20 },
  emptyText: { fontSize: 13, color: theme.colors.textMuted, textAlign: 'center', paddingVertical: 20 },

  viewTxnBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 14, marginBottom: 10 },
  viewTxnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  backDashBtn: { alignItems: 'center', borderWidth: 1.5, borderColor: theme.colors.border, borderRadius: 14, paddingVertical: 14 },
  backDashText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSub },
});
