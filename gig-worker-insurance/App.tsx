import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from './src/theme';
import PolicySelectionScreen from './src/screens/PolicySelectionScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'Home' | 'PolicySelection'>('Home');

  if (currentScreen === 'PolicySelection') {
    return <PolicySelectionScreen onBack={() => setCurrentScreen('Home')} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      {/* --- TOP HEADER --- */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={16} color="#FFF" />
            <View style={styles.profileBadge} />
          </View>
          <View style={styles.earnBadge}>
            <Text style={styles.earnBadgeText}>✨ Protected</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="notifications" size={24} color={theme.colors.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* --- MAIN HERO CARD (Blue Scanner Style) --- */}
        <LinearGradient
          colors={[theme.colors.scannerGradientStart, theme.colors.scannerGradientEnd]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Decorative fluid elements (simulated with rotated views) */}
          <View style={[styles.decorBlob, { top: -20, left: -20, backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          <View style={[styles.decorBlob, { bottom: -40, right: -40, width: 200, height: 200, backgroundColor: 'rgba(255,255,255,0.03)' }]} />

          {/* Sparkles */}
          <Text style={styles.sparkleLeft}>✦</Text>
          <Text style={styles.sparkleRight}>✦</Text>

          {/* Center Shield Icon */}
          <View style={styles.shieldWrap}>
            <View style={styles.shieldGlow} />
            <MaterialCommunityIcons name="shield-check" size={90} color="rgba(255,255,255,0.95)" />
            <Text style={styles.shieldLabel}>You're Protected</Text>
          </View>

          {/* Flash message */}
          <View style={styles.flashRow}>
            <Ionicons name="flash" size={16} color="#4CD964" />
            <Text style={styles.flashText}>Live tracking: Rain & Heat</Text>
          </View>

          {/* Bottom Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn}>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Active Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <MaterialCommunityIcons name="bank-outline" size={16} color="#FFF" />
              <Text style={styles.actionBtnText}>Check payout</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* --- FOLDER CARD (ROI "superCash" Style) --- */}
        <View style={styles.folderSection}>
          {/* Staggered fake cards behind */}
          <View style={styles.backCard3} />
          <View style={styles.backCard2} />
          <View style={styles.backCard1} />

          <View style={styles.folderFront}>
            <Text style={styles.folderTitle}>Get up to ₹10 lakh with auto-payout</Text>
            <View style={styles.folderPillRow}>
              <View style={styles.folderPill}>
                <Ionicons name="flash" size={12} color={theme.colors.textMuted} />
                <Text style={styles.folderPillText}>Instant cash</Text>
              </View>
              <View style={styles.folderPill}>
                <Ionicons name="calendar" size={12} color={theme.colors.textMuted} />
                <Text style={styles.folderPillText}>Weather triggered</Text>
              </View>
              <View style={styles.folderPill}>
                <MaterialCommunityIcons name="percent" size={12} color={theme.colors.textMuted} />
                <Text style={styles.folderPillText}>Verified</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- ADDED POLICY TIERS BUTTON --- */}
        <View style={{ paddingHorizontal: theme.spacing.m, marginBottom: theme.spacing.m }}>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              padding: 16,
              borderRadius: theme.borderRadius.m,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            onPress={() => setCurrentScreen('PolicySelection')}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8 }}>View Policy Tiers (Premium, Mid, Pro)</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* --- MORE PRODUCTS HORIZONTAL SCROLL --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>More Coverages for you</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {/* Card 1 */}
          <View style={styles.miniCard}>
            <LinearGradient colors={['#FFF1E6', '#FFF']} style={styles.miniCardGrad}>
              {/* Fake 3D box icon area */}
              <View style={styles.miniIconWrapper}>
                <Ionicons name="cube" size={40} color="#FF7A45" />
              </View>
              <Text style={styles.miniCardTitle}>Get up to ₹5k on Heatwave</Text>
              <Text style={styles.miniCardSub}>Auto-payout when > 45°C. In just a few clicks!</Text>
              <View style={styles.miniCardLinkRow}>
                <Text style={styles.miniCardLink}>Add cover</Text>
                <View style={styles.linkArrow}><Ionicons name="arrow-forward" size={10} color="#FFF" /></View>
              </View>
            </LinearGradient>
          </View>

          {/* Card 2 */}
          <View style={styles.miniCard}>
            <LinearGradient colors={['#E6F4FF', '#FFF']} style={styles.miniCardGrad}>
              <View style={styles.miniIconWrapper}>
                <Ionicons name="airplane" size={40} color="#4DACFF" />
              </View>
              <Text style={styles.miniCardTitle}>Get covered on Strikes / Riots</Text>
              <Text style={styles.miniCardSub}>Safety net when the market is closed!</Text>
              <View style={styles.miniCardLinkRow}>
                <Text style={styles.miniCardLink}>Add cover</Text>
                <View style={styles.linkArrow}><Ionicons name="arrow-forward" size={10} color="#FFF" /></View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- BOTTOM TAB BAR (Fixed) --- */}
      <View style={styles.bottomTabBar}>
        <View style={styles.tabItem}>
          <View style={styles.activeTabIconBox}>
            <Ionicons name="shield" size={20} color="#FFF" />
          </View>
          <Text style={styles.activeTabText}>Home</Text>
        </View>

        <View style={styles.tabItem}>
          <Ionicons name="card-outline" size={24} color={theme.colors.textMuted} />
          <Text style={styles.tabText}>Policy</Text>
        </View>

        <View style={styles.tabItem}>
          <View style={styles.newBadge}><Text style={styles.newBadgeText}>New</Text></View>
          <Ionicons name="cash-outline" size={24} color={theme.colors.textMuted} />
          <Text style={styles.tabText}>Claims</Text>
        </View>

        <View style={styles.tabItem}>
          <Ionicons name="gift-outline" size={24} color={theme.colors.textMuted} />
          <Text style={styles.tabText}>Rewards</Text>
        </View>

        <View style={styles.tabItem}>
          <Ionicons name="document-text-outline" size={24} color={theme.colors.textMuted} />
          <Text style={styles.tabText}>History</Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContent: { paddingBottom: 60 },

  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.m, paddingVertical: theme.spacing.s, backgroundColor: theme.colors.background },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  profileCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  profileBadge: { position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FF2D55', borderWidth: 2, borderColor: '#FFF' },
  earnBadge: { backgroundColor: theme.colors.successPillBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: theme.borderRadius.round, marginLeft: 12 },
  earnBadgeText: { ...theme.typography.subtitle, color: '#108010' },

  // Big Scanner Hero
  heroCard: { margin: theme.spacing.m, borderRadius: theme.borderRadius.l, padding: theme.spacing.l, minHeight: 400, overflow: 'hidden', alignItems: 'center' },
  decorBlob: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
  sparkleLeft: { position: 'absolute', top: 30, left: 40, color: 'rgba(255,255,255,0.4)', fontSize: 24 },
  sparkleRight: { position: 'absolute', top: 50, right: 30, color: 'rgba(255,255,255,0.7)', fontSize: 16 },

  // Center shield
  shieldWrap: { alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.xl, marginBottom: theme.spacing.l },
  shieldGlow: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.08)' },
  shieldLabel: { color: '#AEE9D1', marginTop: 12, ...theme.typography.subtitle, fontSize: 14 },

  // Flash Message
  flashRow: { flexDirection: 'row', alignItems: 'center', marginTop: 32, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  flashText: { color: '#FFF', marginLeft: 6, ...theme.typography.subtitle },

  // Hero Buttons
  actionRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12, marginTop: 40 },
  actionBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 14, borderRadius: theme.borderRadius.m, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#FFF', marginLeft: 8, ...theme.typography.subtitle },

  // Folder Stack
  folderSection: { marginHorizontal: theme.spacing.m, marginTop: 10, position: 'relative', minHeight: 140, marginBottom: theme.spacing.l },
  backCard1: { position: 'absolute', top: -30, left: '10%', right: '10%', height: 50, backgroundColor: '#785DF6', borderRadius: 12, opacity: 0.6 },
  backCard2: { position: 'absolute', top: -20, left: '5%', right: '5%', height: 50, backgroundColor: '#8B74F7', borderRadius: 12, opacity: 0.8 },
  backCard3: { position: 'absolute', top: -10, left: '2%', right: '2%', height: 50, backgroundColor: '#A18DF9', borderRadius: 12 },
  folderFront: { backgroundColor: '#FFF', padding: theme.spacing.l, borderRadius: theme.borderRadius.m, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  folderTitle: { ...theme.typography.header, marginBottom: theme.spacing.m },
  folderPillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  folderPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  folderPillText: { ...theme.typography.small, color: theme.colors.textMuted, marginLeft: 4 },

  // Horizontal Cards
  sectionHeader: { paddingHorizontal: theme.spacing.m, marginBottom: theme.spacing.m },
  sectionTitle: { ...theme.typography.header },
  horizontalScroll: { paddingHorizontal: theme.spacing.m, paddingBottom: theme.spacing.l, gap: theme.spacing.m },
  miniCard: { width: 160, borderRadius: theme.borderRadius.m, overflow: 'hidden' },
  miniCardGrad: { padding: theme.spacing.m, flex: 1 },
  miniIconWrapper: { width: 60, height: 60, alignSelf: 'flex-start', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  miniCardTitle: { ...theme.typography.title, fontSize: 16, marginBottom: 8 },
  miniCardSub: { ...theme.typography.body, color: theme.colors.textMuted, marginBottom: 16 },
  miniCardLinkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto' },
  miniCardLink: { color: theme.colors.primary, ...theme.typography.subtitle, marginRight: 6 },
  linkArrow: { backgroundColor: theme.colors.primary, width: 16, height: 16, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },

  // Bottom Nav
  bottomTabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 85, backgroundColor: '#FFF', flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.colors.borderLight },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  activeTabIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  activeTabText: { ...theme.typography.small, color: theme.colors.primary, fontWeight: '700' },
  tabText: { ...theme.typography.small, color: theme.colors.textMuted, marginTop: 4 },
  newBadge: { position: 'absolute', top: 5, right: '20%', backgroundColor: '#FF2E93', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4, zIndex: 10 },
  newBadgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' }
});
