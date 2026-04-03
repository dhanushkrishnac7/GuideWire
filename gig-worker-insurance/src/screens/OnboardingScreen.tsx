import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme';

interface Props {
  onComplete: (data: { zone: string; fleet: string }) => void;
}

const FLEETS = [
  { id: 'Food Delivery', title: 'Food Delivery', subtitle: 'ZOMATO, SWIGGY', icon: 'restaurant-outline' },
  { id: 'Grocery', title: 'Grocery', subtitle: 'BLINKIT, ZEPTO', icon: 'basket-outline' },
  { id: 'E-commerce', title: 'E-commerce', subtitle: 'AMAZON, FLIPKART', icon: 'cube-outline' },
  { id: 'Logistics', title: 'Logistics', subtitle: 'PORTER, DUNZO', icon: 'bicycle-outline' },
];

export default function OnboardingScreen({ onComplete }: Props) {
  const [fleet, setFleet] = useState('Food Delivery');
  const [deliveryId, setDeliveryId] = useState('');

  const handleComplete = () => {
    onComplete({ zone: 'Koramangala', fleet });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="shield" size={16} color="#FFF" />
            </View>
            <Text style={styles.logoText}>KINETIC</Text>
          </View>
          <View style={styles.stepPill}>
            <Text style={styles.stepText}>STEP 1 OF 3</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <Text style={styles.heroTitle}>Protect your <Text style={styles.heroTitleHighlight}>daily earnings</Text> from rain, heat, and strikes.</Text>
          <Text style={styles.heroSub}>Join 50,000+ delivery partners securing their income with instant weather payouts.</Text>

          {/* Segment Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerSegmentActive} />
            <View style={styles.dividerSegment} />
            <View style={styles.dividerSegment} />
          </View>

          <Text style={styles.sectionLabel}>SELECT YOUR FLEET</Text>

          {/* Grid Container with Shield background */}
          <View style={styles.gridWrapper}>
            <Ionicons name="shield" size={300} color="#F5F5F7" style={styles.shieldBg} />
            <View style={styles.fleetGrid}>
              {FLEETS.map(f => {
                const isActive = fleet === f.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.fleetCard, isActive && styles.fleetCardActive]}
                    onPress={() => setFleet(f.id)}
                    activeOpacity={0.8}
                  >
                    {isActive && (
                      <View style={styles.activeCheckCircle}>
                        <Ionicons name="checkmark" size={10} color="#FFF" />
                      </View>
                    )}
                    <Ionicons name={f.icon as any} size={28} color={isActive ? theme.colors.primary : theme.colors.textMuted} style={{ marginBottom: 12 }} />
                    <Text style={[styles.fleetTitle, isActive && styles.fleetTitleActive]}>{f.title}</Text>
                    <Text style={styles.fleetSubtitle}>{f.subtitle}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Delivery ID Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>ENTER DELIVERY ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. ZM-982341"
              placeholderTextColor={theme.colors.textMuted}
              value={deliveryId}
              onChangeText={setDeliveryId}
              autoCapitalize="characters"
            />
          </View>

          {/* AI Verified Security */}
          <View style={styles.securityBox}>
            <View style={styles.securityIconCirc}>
              <Ionicons name="shield-checkmark" size={16} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.securityTitle}>AI-VERIFIED SECURITY</Text>
              <Text style={styles.securitySub}>Your data is encrypted with enterprise-grade safety protocols.</Text>
            </View>
          </View>

        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomArea}>
          <TouchableOpacity style={styles.getProtectedBtn} onPress={handleComplete}>
            <Text style={styles.getProtectedText}>Get Protected <Ionicons name="arrow-forward" size={14} color="#FFF" /></Text>
          </TouchableOpacity>
          <Text style={styles.noPaperworkText}>NO PAPERWORK REQUIRED  •  STARTS AT ₹5/DAY</Text>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoIcon: { width: 24, height: 24, borderRadius: 6, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  logoText: { fontSize: 16, fontWeight: '900', color: theme.colors.primary, letterSpacing: -0.5 },
  stepPill: { backgroundColor: '#FFEDDF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  stepText: { fontSize: 9, fontWeight: '800', color: '#E8472A', letterSpacing: 0.5 },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  heroTitle: { fontSize: 32, fontWeight: '900', color: theme.colors.primary, lineHeight: 40, marginTop: 24, marginBottom: 16 },
  heroTitleHighlight: { color: '#FF7A45' },
  heroSub: { fontSize: 13, color: theme.colors.textSub, lineHeight: 20, marginBottom: 32, paddingRight: 40 },

  dividerRow: { flexDirection: 'row', gap: 8, marginBottom: 40 },
  dividerSegmentActive: { flex: 1, height: 4, backgroundColor: theme.colors.primary, borderRadius: 2 },
  dividerSegment: { flex: 1.5, height: 4, backgroundColor: '#F0F1F5', borderRadius: 2 },

  sectionLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 16 },

  gridWrapper: { position: 'relative', marginBottom: 32 },
  shieldBg: { position: 'absolute', right: -60, top: 0, opacity: 0.6, zIndex: -1 },

  fleetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  fleetCard: {
    width: '48%', backgroundColor: '#F0F1F5', borderRadius: 16, padding: 20,
    borderWidth: 2, borderColor: 'transparent', position: 'relative'
  },
  fleetCardActive: { backgroundColor: '#FFF', borderColor: theme.colors.primary, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  activeCheckCircle: { position: 'absolute', top: 12, right: 12, width: 20, height: 20, borderRadius: 10, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  fleetTitle: { fontSize: 14, fontWeight: '800', color: theme.colors.textMain, marginBottom: 4 },
  fleetTitleActive: { color: theme.colors.primary },
  fleetSubtitle: { fontSize: 8, fontWeight: '700', color: theme.colors.textMuted, letterSpacing: 0.5 },

  inputContainer: { marginBottom: 24 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: '#F0F1F5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 16, fontWeight: '700', color: theme.colors.primary },

  securityBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8EEFE', padding: 16, borderRadius: 12, gap: 12 },
  securityIconCirc: { width: 32, height: 32, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  securityTitle: { fontSize: 11, fontWeight: '800', color: theme.colors.primary, letterSpacing: 0.5, marginBottom: 2 },
  securitySub: { fontSize: 10, color: theme.colors.textSub, lineHeight: 14 },

  bottomArea: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12, backgroundColor: '#FFF' },
  getProtectedBtn: { width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary, paddingVertical: 18, borderRadius: 12, marginBottom: 12 },
  getProtectedText: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  noPaperworkText: { fontSize: 10, fontWeight: '800', color: theme.colors.textMuted, letterSpacing: 1.5, textAlign: 'center' },
});
